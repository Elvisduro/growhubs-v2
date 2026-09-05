import { promises as dns } from 'dns';

/**
 * The one seam where this module does real network I/O. Injected as an
 * interface (not called directly by DomainOnboardingService) so tests —
 * including this sandbox's own build/verification run, where outbound DNS
 * resolution is blocked by network policy (confirmed: a raw
 * `dns.resolveTxt` call against a real domain timed out here) — can
 * supply a fake resolver instead of requiring live DNS access.
 */
export interface DnsResolver {
  resolveTxt(domain: string): Promise<string[][]>;
  resolveCname(domain: string): Promise<string[]>;
}

export class NodeDnsResolver implements DnsResolver {
  resolveTxt(domain: string): Promise<string[][]> {
    return dns.resolveTxt(domain);
  }
  resolveCname(domain: string): Promise<string[]> {
    return dns.resolveCname(domain);
  }
}
