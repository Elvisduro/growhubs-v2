import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { StateMachineDefinition } from './entities/state-machine-definition.entity';
import { TransitionDefinition } from './entities/transition-definition.entity';
import { TransitionAttempt, TransitionAttemptResult } from './entities/transition-attempt.entity';
import { Approval, ApprovalDecision } from './entities/approval.entity';
import { StateMachineObjectState } from './entities/state-machine-object-state.entity';
import { TransitionCommand, TransitionResult, TransitionOutcome } from './state-machine.types';
import { evaluateGuards, KILL_SWITCH_IN_EFFECT_STATES, GuardSpec } from './guard-evaluator';
import { KillSwitchActivation } from '../../kill-switch/entities/kill-switch-activation.entity';
import { KillSwitchDefinition } from '../../kill-switch/entities/kill-switch-definition.entity';

/**
 * StateMachineEngine — the shared substrate every one of PLT-005's 22
 * canonical lifecycle families is meant to be wired into
 * (PLT-005_STATE_MACHINE_TABLES_SCHEMA_v1.md §1). This service implements
 * exactly the contracts that document's §3 fixes as non-negotiable:
 *
 *  - §3.1 Domain ownership (CORE-C2000): this engine does not care WHAT
 *    object_type is being transitioned — it never reaches into a domain
 *    module's own tables. Domain modules call `attemptTransition`; they
 *    never call another domain's service directly to mutate state.
 *  - §3.2 Command/concurrency contract (CORE-C1997-C1999): expected-version
 *    optimistic concurrency, idempotency, and the full canonical failure
 *    vocabulary.
 *  - §2.3 TransitionAttempt immutability (CORE-C1994): every attempt,
 *    success or failure, is written once and never updated or deleted.
 *
 * Rewritten against TypeORM's DataSource/EntityManager transaction API
 * after the Prisma -> TypeORM pivot (Prisma's binary CDN is blocked by this
 * sandbox's network egress policy — see package.json history). The
 * transition logic and failure-vocabulary contract are unchanged; only the
 * persistence calls differ. Note the entities declare no ORM-level
 * relations between TransitionDefinition and StateMachineDefinition (each
 * stores the other's id as a plain column, matching PLT-005's schema, which
 * models these as id references, not foreign-key relations) — so the owning
 * machine is fetched as a separate query rather than a Prisma-style
 * `include`.
 */
@Injectable()
export class StateMachineEngine {
  private readonly logger = new Logger(StateMachineEngine.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Attempts one transition. This is the ONLY way any domain module in this
   * codebase is permitted to move an object from one state to another —
   * never a direct UPDATE on a status column (this is the enforcement
   * mechanism behind PLT-005 CORE-C2048's "never a direct SQL status edit,"
   * generalized from the repair-queue case to every transition).
   */
  async attemptTransition(command: TransitionCommand): Promise<TransitionResult> {
    return this.dataSource.transaction(async (manager) => {
      // --- Idempotency check (CORE-C1997) -----------------------------------
      const existingAttempt = await manager.findOne(TransitionAttempt, {
        where: {
          objectType: command.objectType,
          objectId: command.objectId,
          idempotencyKey: command.idempotencyKey,
        },
      });
      if (existingAttempt) {
        this.logger.log(
          `Idempotent replay for ${command.objectType}/${command.objectId} key=${command.idempotencyKey}`,
        );
        return {
          outcome: existingAttempt.result as TransitionOutcome,
          attemptId: existingAttempt.attemptId,
        };
      }

      // --- Load the transition definition and its owning machine ------------
      const transitionDef = await manager.findOne(TransitionDefinition, {
        where: { transitionDefId: command.transitionDefId },
      });
      if (!transitionDef) {
        return this.recordAttempt(manager, command, TransitionAttemptResult.VALIDATION_FAILED);
      }
      const machine = await manager.findOne(StateMachineDefinition, {
        where: { machineId: transitionDef.machineId },
      });
      if (!machine) {
        return this.recordAttempt(manager, command, TransitionAttemptResult.VALIDATION_FAILED);
      }

      // --- Load or initialize current object state/version ------------------
      const objectState = await manager.findOne(StateMachineObjectState, {
        where: { objectType: command.objectType, objectId: command.objectId },
      });

      if (!objectState) {
        // First transition for this object: it must be starting from the
        // machine's declared initial_state, and the caller's expectedVersion
        // must be 0.
        if (command.expectedVersion !== 0) {
          return this.recordAttempt(manager, command, TransitionAttemptResult.VERSION_CONFLICT);
        }
        if (transitionDef.fromState !== machine.initialState) {
          return this.recordAttempt(manager, command, TransitionAttemptResult.PRECONDITION_FAILED);
        }
      } else {
        // --- Optimistic concurrency check (CORE-C1997-C1998) -----------------
        if (objectState.currentVersion !== command.expectedVersion) {
          this.logger.warn(
            `VERSION_CONFLICT on ${command.objectType}/${command.objectId}: ` +
              `expected=${command.expectedVersion} actual=${objectState.currentVersion}`,
          );
          const result = await this.recordAttempt(
            manager,
            command,
            TransitionAttemptResult.VERSION_CONFLICT,
          );
          return { ...result, currentVersion: objectState.currentVersion };
        }
        // --- Precondition check: does fromState match current state? --------
        if (transitionDef.fromState !== objectState.currentState) {
          return this.recordAttempt(manager, command, TransitionAttemptResult.PRECONDITION_FAILED);
        }
      }

      // --- Guard evaluation (guards/evidenceRequirements JSON) ---------------
      // See guard-evaluator.ts for the full design note. Kill-Switch families
      // declared on the transition are resolved against a real database read
      // of kill_switch_activations/kill_switch_definitions here — the one
      // guard check the pure evaluator cannot answer on its own — then the
      // rest of the declared guards/evidence are checked in-process.
      const guardSpec = (transitionDef.guards ?? {}) as GuardSpec;
      let activeKillSwitchFamilies = new Set<string>();
      if (guardSpec.killSwitchFamilies?.length) {
        const inEffect = await manager
          .createQueryBuilder(KillSwitchActivation, 'activation')
          .innerJoin(
            KillSwitchDefinition,
            'definition',
            'definition.definition_id = activation.definition_id',
          )
          .where('activation.state IN (:...states)', {
            states: KILL_SWITCH_IN_EFFECT_STATES,
          })
          .andWhere('definition.family IN (:...families)', {
            families: guardSpec.killSwitchFamilies,
          })
          .select('DISTINCT definition.family', 'family')
          .getRawMany<{ family: string }>();
        activeKillSwitchFamilies = new Set(inEffect.map((r) => r.family));
      }
      const guardFailure = evaluateGuards(transitionDef, command, activeKillSwitchFamilies);
      if (guardFailure) {
        return this.recordAttempt(manager, command, guardFailure);
      }

      // --- Approval check ------------------------------------------------
      if (transitionDef.approvalPolicyRef) {
        const approval = await manager.findOne(Approval, {
          where: { approvalId: transitionDef.approvalPolicyRef },
        });
        if (
          !approval ||
          approval.decision !== ApprovalDecision.APPROVED ||
          approval.deadline < new Date()
        ) {
          return this.recordAttempt(manager, command, TransitionAttemptResult.APPROVAL_FAILED);
        }
      }

      // --- Commit the transition ---------------------------------------------
      const newVersion = (objectState?.currentVersion ?? 0) + 1;
      await manager.upsert(
        StateMachineObjectState,
        {
          objectType: command.objectType,
          objectId: command.objectId,
          machineId: transitionDef.machineId,
          currentState: transitionDef.toState,
          currentVersion: newVersion,
        },
        ['objectType', 'objectId'],
      );

      const result = await this.recordAttempt(manager, command, TransitionAttemptResult.SUCCESS);
      return { ...result, currentVersion: newVersion };
    });
  }

  /**
   * Writes the immutable TransitionAttempt audit row (CORE-C1994). This
   * method is the ONLY place in the codebase that writes to
   * transition_attempts, and nothing in this codebase ever issues an
   * UPDATE or DELETE against that table — enforced structurally by never
   * exposing an update/delete method here.
   */
  private async recordAttempt(
    manager: EntityManager,
    command: TransitionCommand,
    outcome: TransitionAttemptResult,
  ): Promise<TransitionResult> {
    const attempt = await manager.save(
      manager.create(TransitionAttempt, {
        objectType: command.objectType,
        objectId: command.objectId,
        transitionDefId: command.transitionDefId,
        expectedVersion: command.expectedVersion,
        actorRef: command.actorRef,
        authorityRef: command.authorityRef,
        correlationId: command.correlationId,
        causationId: command.causationId,
        idempotencyKey: command.idempotencyKey,
        result: outcome,
      }),
    );
    return { outcome: outcome as unknown as TransitionOutcome, attemptId: attempt.attemptId };
  }
}
