/**
 * The pure, I/O-free decision this codebase's DNS-verification step
 * reduces to: given the TXT records actually observed for a domain (or
 * CNAME target — the caller resolves whichever `verificationMethod`
 * requires and passes the result in here), does the expected token
 * appear? Mirrors this codebase's established pattern (guard-evaluator.ts,
 * revalidation.py) of keeping the actual DNS resolution — real network
 * I/O — in the caller, so the decision itself is unit-testable without a
 * network call.
 */
export function observedRecordsProveControl(observedRecords: string[], expectedToken: string): boolean {
  return observedRecords.some((record) => record.trim() === expectedToken.trim());
}
