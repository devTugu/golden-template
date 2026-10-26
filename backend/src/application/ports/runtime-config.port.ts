/** Application-layer config — no Nest ConfigService in use cases. */
export interface IRuntimeConfig {
  getLoginMaxFailedAttempts(): number;
  getLoginLockoutMinutes(): number;
  getPermissionCacheTtlSec(): number;
  getMfaRequiredRolesRaw(): string | undefined;
  getAuditRetentionDays(): number;
}
