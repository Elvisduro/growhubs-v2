/**
 * One-off, real-database verification for the guard-evaluation pipeline
 * (guard-evaluator.ts + StateMachineEngine wiring), same evidentiary
 * rigor used earlier in this engagement for RLS (ChildSafetyCase,
 * workspace_memberships/billing_accounts): proves the Kill-Switch guard
 * check actually blocks a live transition attempt through the real
 * StateMachineEngine against growhubs_v2_dev, then proves it un-blocks
 * once the switch is closed — not a unit test with mocks, an end-to-end
 * check against Postgres. Cleans up everything it inserts. Not part of
 * the application; run once via ts-node and discarded.
 */
import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';
import { StateMachineEngine } from '../src/platform/state-machine/state-machine.service';
import { StateMachineDefinition } from '../src/platform/state-machine/entities/state-machine-definition.entity';
import { TransitionDefinition } from '../src/platform/state-machine/entities/transition-definition.entity';
import { StateMachineObjectState } from '../src/platform/state-machine/entities/state-machine-object-state.entity';
import { TransitionAttempt } from '../src/platform/state-machine/entities/transition-attempt.entity';
import {
  KillSwitchDefinition,
  KillSwitchFamily,
  KillSwitchRiskTier,
  KillSwitchFailureMode,
  KillSwitchDefinitionState,
} from '../src/kill-switch/entities/kill-switch-definition.entity';
import {
  KillSwitchActivation,
  KillSwitchActivationState,
} from '../src/kill-switch/entities/kill-switch-activation.entity';

async function main() {
  await AppDataSource.initialize();
  const engine = new StateMachineEngine(AppDataSource);
  const objectType = 'GUARD_PIPELINE_PROBE';
  const objectId = 'probe-' + Date.now();

  const machine = await AppDataSource.manager.save(
    AppDataSource.manager.create(StateMachineDefinition, {
      familyKey: 'GUARD_PIPELINE_PROBE',
      version: 1,
      ownerDomain: 'probe',
      initialState: 'DRAFT',
      terminalStates: ['DONE'],
    }),
  );
  const transitionDef = await AppDataSource.manager.save(
    AppDataSource.manager.create(TransitionDefinition, {
      machineId: machine.machineId,
      fromState: 'DRAFT',
      toState: 'DONE',
      guards: { killSwitchFamilies: [KillSwitchFamily.AI] },
      evidenceRequirements: {},
    }),
  );
  const definition = await AppDataSource.manager.save(
    AppDataSource.manager.create(KillSwitchDefinition, {
      name: 'Guard pipeline probe switch',
      family: KillSwitchFamily.AI,
      riskTier: KillSwitchRiskTier.K1,
      failureMode: KillSwitchFailureMode.FAIL_CLOSED,
      state: KillSwitchDefinitionState.PRODUCTION_ELIGIBLE,
    }),
  );
  const activation = await AppDataSource.manager.save(
    AppDataSource.manager.create(KillSwitchActivation, {
      definitionId: definition.definitionId,
      definitionVersion: definition.version,
      state: KillSwitchActivationState.ACTIVE,
      blastRadiusScope: { probe: true },
      idempotencyKey: 'probe-activation-' + Date.now(),
    }),
  );

  try {
    console.log('--- Attempt #1: AI kill-switch is ACTIVE, expect KILL_SWITCH ---');
    const r1 = await engine.attemptTransition({
      objectType,
      objectId,
      transitionDefId: transitionDef.transitionDefId,
      expectedVersion: 0,
      actorRef: 'probe-actor',
      idempotencyKey: 'probe-attempt-1',
      correlationId: 'probe-correlation-1',
    });
    console.log('Result:', r1);
    if (r1.outcome !== 'KILL_SWITCH') {
      throw new Error(`FAIL: expected KILL_SWITCH, got ${r1.outcome}`);
    }
    console.log('PASS: transition correctly blocked while switch is ACTIVE.\n');

    console.log('--- Closing the kill-switch activation ---');
    activation.state = KillSwitchActivationState.CLOSED;
    activation.closedAt = new Date();
    await AppDataSource.manager.save(activation);

    console.log('--- Attempt #2: same command, new idempotency key, switch CLOSED, expect SUCCESS ---');
    const r2 = await engine.attemptTransition({
      objectType,
      objectId,
      transitionDefId: transitionDef.transitionDefId,
      expectedVersion: 0,
      actorRef: 'probe-actor',
      idempotencyKey: 'probe-attempt-2',
      correlationId: 'probe-correlation-2',
    });
    console.log('Result:', r2);
    if (r2.outcome !== 'SUCCESS') {
      throw new Error(`FAIL: expected SUCCESS once switch closed, got ${r2.outcome}`);
    }
    console.log('PASS: transition proceeds once the switch is CLOSED.\n');

    console.log('--- Attempt #3: replay of attempt #1s idempotency key, expect the ORIGINAL KILL_SWITCH result (idempotent replay) ---');
    const r3 = await engine.attemptTransition({
      objectType,
      objectId,
      transitionDefId: transitionDef.transitionDefId,
      expectedVersion: 0,
      actorRef: 'probe-actor',
      idempotencyKey: 'probe-attempt-1',
      correlationId: 'probe-correlation-1',
    });
    console.log('Result:', r3);
    if (r3.outcome !== 'KILL_SWITCH') {
      throw new Error(`FAIL: expected idempotent replay of KILL_SWITCH, got ${r3.outcome}`);
    }
    console.log('PASS: idempotency-key replay returns the original recorded outcome, not a re-evaluation.\n');

    console.log('ALL CHECKS PASSED.');
  } finally {
    // --- cleanup: remove everything this script inserted ---
    await AppDataSource.manager.delete(TransitionAttempt, { objectType, objectId });
    await AppDataSource.manager.delete(StateMachineObjectState, { objectType, objectId });
    await AppDataSource.manager.delete(KillSwitchActivation, { activationId: activation.activationId });
    await AppDataSource.manager.delete(KillSwitchDefinition, { definitionId: definition.definitionId });
    await AppDataSource.manager.delete(TransitionDefinition, { transitionDefId: transitionDef.transitionDefId });
    await AppDataSource.manager.delete(StateMachineDefinition, { machineId: machine.machineId });
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
