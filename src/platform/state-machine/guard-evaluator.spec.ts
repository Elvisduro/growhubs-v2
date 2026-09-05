import { evaluateGuards } from './guard-evaluator';
import { TransitionAttemptResult } from './entities/transition-attempt.entity';

describe('evaluateGuards', () => {
  const baseTransitionDef = { guards: {}, evidenceRequirements: {} };

  it('passes (returns null) when no guards/evidence are declared', () => {
    expect(evaluateGuards(baseTransitionDef, { guardContext: {} }, new Set())).toBeNull();
  });

  it('returns KILL_SWITCH when a declared family is in the active set', () => {
    const def = { guards: { killSwitchFamilies: ['PAYMENTS_CHECKOUT_REFUND_PAYOUT_SETTLEMENT_POINTS'] }, evidenceRequirements: {} };
    const active = new Set(['PAYMENTS_CHECKOUT_REFUND_PAYOUT_SETTLEMENT_POINTS']);
    expect(evaluateGuards(def, { guardContext: {} }, active)).toBe(TransitionAttemptResult.KILL_SWITCH);
  });

  it('passes when the declared family is NOT in the active set', () => {
    const def = { guards: { killSwitchFamilies: ['AI'] }, evidenceRequirements: {} };
    const active = new Set(['PAYMENTS_CHECKOUT_REFUND_PAYOUT_SETTLEMENT_POINTS']);
    expect(evaluateGuards(def, { guardContext: {} }, active)).toBeNull();
  });

  it('returns EVIDENCE_FAILED when a required context key is missing', () => {
    const def = { guards: {}, evidenceRequirements: { requiredKeys: ['complianceCheckPassed'] } };
    expect(evaluateGuards(def, { guardContext: {} }, new Set())).toBe(
      TransitionAttemptResult.EVIDENCE_FAILED,
    );
  });

  it('returns EVIDENCE_FAILED when a required context key is falsy', () => {
    const def = { guards: {}, evidenceRequirements: { requiredKeys: ['complianceCheckPassed'] } };
    expect(
      evaluateGuards(def, { guardContext: { complianceCheckPassed: false } }, new Set()),
    ).toBe(TransitionAttemptResult.EVIDENCE_FAILED);
  });

  it('passes when all required evidence keys are truthy', () => {
    const def = { guards: {}, evidenceRequirements: { requiredKeys: ['complianceCheckPassed'] } };
    expect(
      evaluateGuards(def, { guardContext: { complianceCheckPassed: true } }, new Set()),
    ).toBeNull();
  });

  it('returns VALIDATION_FAILED on a requiredContextEquals mismatch', () => {
    const def = { guards: { requiredContextEquals: { sourceVersion: 3 } }, evidenceRequirements: {} };
    expect(
      evaluateGuards(def, { guardContext: { sourceVersion: 2 } }, new Set()),
    ).toBe(TransitionAttemptResult.VALIDATION_FAILED);
  });

  it('passes a requiredContextEquals match', () => {
    const def = { guards: { requiredContextEquals: { sourceVersion: 3 } }, evidenceRequirements: {} };
    expect(
      evaluateGuards(def, { guardContext: { sourceVersion: 3 } }, new Set()),
    ).toBeNull();
  });

  it('returns POLICY_FAILED when a forbidden-truthy key is truthy', () => {
    const def = { guards: { forbiddenContextTruthy: ['hasUnresolvedObligation'] }, evidenceRequirements: {} };
    expect(
      evaluateGuards(def, { guardContext: { hasUnresolvedObligation: true } }, new Set()),
    ).toBe(TransitionAttemptResult.POLICY_FAILED);
  });

  it('passes when the forbidden-truthy key is absent/falsy', () => {
    const def = { guards: { forbiddenContextTruthy: ['hasUnresolvedObligation'] }, evidenceRequirements: {} };
    expect(evaluateGuards(def, { guardContext: {} }, new Set())).toBeNull();
  });

  it('checks Kill-Switch before evidence/context guards (short-circuits on the first failure)', () => {
    const def = {
      guards: { killSwitchFamilies: ['AI'], requiredContextEquals: { x: 1 } },
      evidenceRequirements: { requiredKeys: ['neverProvided'] },
    };
    const active = new Set(['AI']);
    // context satisfies neither evidence nor requiredContextEquals either,
    // but KILL_SWITCH must be the reported outcome since it is checked first.
    expect(evaluateGuards(def, { guardContext: {} }, active)).toBe(
      TransitionAttemptResult.KILL_SWITCH,
    );
  });
});
