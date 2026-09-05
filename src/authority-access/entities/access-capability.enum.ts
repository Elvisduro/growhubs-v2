/**
 * XD-008 §1 (XD-C0584) — every distinct action a person could take on a
 * resource is independently authorized: "can view" never silently implies
 * "can download" or "can export." Shared by AccessGrant and AccessDecision.
 */
export enum AccessCapability {
  DISCOVER = 'DISCOVER',
  PREVIEW = 'PREVIEW',
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  INTERACT = 'INTERACT',
  SUBMIT = 'SUBMIT',
  ASSESS = 'ASSESS',
  MODERATE = 'MODERATE',
  MANAGE = 'MANAGE',
  PUBLISH = 'PUBLISH',
  SELL = 'SELL',
  BUY = 'BUY',
  EXPORT = 'EXPORT',
  SHARE = 'SHARE',
  INVITE = 'INVITE',
  GRANT = 'GRANT',
  ANALYTICS = 'ANALYTICS',
  SENSITIVE = 'SENSITIVE',
  FINANCIAL = 'FINANCIAL',
  SUPERADMIN = 'SUPERADMIN',
}
