import { TransitionAttemptResult } from './entities/transition-attempt.entity';
import { TransitionDefinition } from './entities/transition-definition.entity';
import { TransitionCommand } from './state-machine.types';

/**
 * ENGINEERING SYNTHESIS (flagged per this engagement's citation discipline):
 * `PLT-005_STATE_MACHINE_TABLES_SCHEMA_v1.md` §2.2 names `guards` and
 * `evidence_requirements` as jsonb columns on TransitionDefinition and
 * requires (§3) that a real guard-evaluation pipeline exist — but no
 * approved decision gives a literal DSL/field-shape for what goes inside
 * those two JSON blobs. The shapes below are this codebase's own minimal,
 * documented design for satisfying that requirement, not a transcribed
 * clause. They map onto PLT-005 §3.2 (CORE-C1999)'s EXISTING canonical
 * failure vocabulary (TransitionAttemptResult) rather than inventing new
 * outcome codes.
 *
 * `evidenceRequirements.requiredKeys` — context keys that must be present
 * and truthy on the command's `guardContext` for the transition to be
 * considered evidenced at all (-> EVIDENCE_FAILED if any is missing/falsy).
 *
 * `guards.requiredContextEquals` — exact-match predicates against
 * `guardContext` (-> VALIDATION_FAILED on any mismatch); this is for
 * "the command must be for exactly this value" checks (e.g. a pinned
 * source version), distinct from evidence presence.
 *
 * `guards.forbiddenContextTruthy` — context keys that must NOT be truthy
 * (-> POLICY_FAILED if any is) — e.g. a domain-specific business-policy
 * block ("no unresolved obligation blocks this withdrawal").
 *
 * `guards.killSwitchFamilies` — `KillSwitchFamily` values (PLT-003,
 * `22_KillSwitch.md`) that, if any has an in-effect `KillSwitchActivation`
 * at the moment of this attempt, blocks the transition with the
 * KILL_SWITCH outcome — the ONE guard check this evaluator cannot answer
 * on its own (it requires a real database read of kill_switch_activations
 * joined to kill_switch_definitions); the caller (StateMachineEngine)
 * resolves the in-effect family set first and passes it in, keeping this
 * function itself pure and unit-testable without a database.
 *
 * Evaluation order (deliberate, matches PLT-005's own posture that an
 * emergency Kill-Switch pre-empts ordinary business/evidence checks):
 * Kill-Switch -> evidence -> context-equals -> forbidden-truthy. The first
 * failing check short-circuits; this function never reports more than one
 * failure per call, consistent with TransitionAttempt recording exactly
 * one `result` per attempt.
 */
export interface GuardSpec {
  killSwitchFamilies?: string[];
  requiredContextEquals?: Record<string, unknown>;
  forbiddenContextTruthy?: string[];
}

export interface EvidenceSpec {
  requiredKeys?: string[];
}

/**
 * Pure guard evaluation — no I/O. Returns the specific
 * `TransitionAttemptResult` failure code to record, or `null` if every
 * declared guard/evidence check passes (the engine proceeds to its
 * existing approval check and then commits).
 */
export function evaluateGuards(
  transitionDef: Pick<TransitionDefinition, 'guards' | 'evidenceRequirements'>,
  command: Pick<TransitionCommand, 'guardContext'>,
  activeKillSwitchFamilies: ReadonlySet<string>,
): TransitionAttemptResult | null {
  const guards = (transitionDef.guards ?? {}) as GuardSpec;
  const evidence = (transitionDef.evidenceRequirements ?? {}) as EvidenceSpec;
  const context = command.guardContext ?? {};

  // --- Kill-Switch (checked first — emergency containment pre-empts
  // ordinary business/evidence checks, per PLT-003's posture). ---
  if (guards.killSwitchFamilies?.length) {
    const blocked = guards.killSwitchFamilies.some((family) =>
      activeKillSwitchFamilies.has(family),
    );
    if (blocked) {
      return TransitionAttemptResult.KILL_SWITCH;
    }
  }

  // --- Evidence presence. ---
  if (evidence.requiredKeys?.length) {
    const missing = evidence.requiredKeys.some((key) => !context[key]);
    if (missing) {
      return TransitionAttemptResult.EVIDENCE_FAILED;
    }
  }

  // --- Exact-match context predicates. ---
  if (guards.requiredContextEquals) {
    for (const [key, expected] of Object.entries(guards.requiredContextEquals)) {
      if (context[key] !== expected) {
        return TransitionAttemptResult.VALIDATION_FAILED;
      }
    }
  }

  // --- Forbidden-truthy business-policy predicates. ---
  if (guards.forbiddenContextTruthy?.length) {
    const violated = guards.forbiddenContextTruthy.some((key) => Boolean(context[key]));
    if (violated) {
      return TransitionAttemptResult.POLICY_FAILED;
    }
  }

  return null;
}

/**
 * `KillSwitchActivation` states (`22_KillSwitch.md`) in which the switch is
 * still actively restricting the platform — i.e. everything except the
 * three "not yet firing or fully resolved" states DRAFT/ARMED and the
 * three genuinely closed-out states CLOSED/FAILED/CANCELLED. Engineering
 * synthesis: the source doc gives the 13 state names and their meanings
 * but does not itself enumerate "which subset counts as in-effect for a
 * downstream guard check" — that grouping is this codebase's own, derived
 * directly from each state's stated meaning (ACTIVE/STABILISING/
 * RECOVERY_READY/RESTORING/MONITORING/PARTIAL/SCOPE_CHANGE/
 * RESTORE_FAILURE are all still-mid-incident states in the doc's own
 * transition table; only CLOSED/FAILED/CANCELLED and the pre-fire
 * DRAFT/ARMED are not).
 */
export const KILL_SWITCH_IN_EFFECT_STATES = [
  'ACTIVE',
  'STABILISING',
  'RECOVERY_READY',
  'RESTORING',
  'MONITORING',
  'PARTIAL',
  'SCOPE_CHANGE',
  'RESTORE_FAILURE',
] as const;
