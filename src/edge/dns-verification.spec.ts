import { observedRecordsProveControl } from './dns-verification';

describe('observedRecordsProveControl', () => {
  it('returns true when one of the observed records matches the token exactly', () => {
    expect(observedRecordsProveControl(['some-other-record', 'growhubs-verify-abc123'], 'growhubs-verify-abc123')).toBe(
      true,
    );
  });

  it('returns false when no observed record matches', () => {
    expect(observedRecordsProveControl(['some-other-record'], 'growhubs-verify-abc123')).toBe(false);
  });

  it('returns false for an empty record set', () => {
    expect(observedRecordsProveControl([], 'growhubs-verify-abc123')).toBe(false);
  });

  it('tolerates surrounding whitespace on the observed record', () => {
    expect(observedRecordsProveControl(['  growhubs-verify-abc123  '], 'growhubs-verify-abc123')).toBe(true);
  });

  it('does not do partial/substring matching', () => {
    expect(observedRecordsProveControl(['growhubs-verify-abc123-extra'], 'growhubs-verify-abc123')).toBe(false);
  });
});
