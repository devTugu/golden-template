import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';

@Injectable()
export class NestRuntimeConfigAdapter implements IRuntimeConfig {
  constructor(private readonly config: ConfigService) {}

  getLoginMaxFailedAttempts(): number {
    return this.config.get<number>('LOGIN_MAX_FAILED_ATTEMPTS', 5);
  }

  getLoginLockoutMinutes(): number {
    return this.config.get<number>('LOGIN_LOCKOUT_MINUTES', 15);
  }

  getPermissionCacheTtlSec(): number {
    return this.config.get<number>('PERMISSION_CACHE_TTL_SEC', 60);
  }

  getMfaRequiredRolesRaw(): string | undefined {
    return this.config.get<string>('MFA_REQUIRED_ROLES');
  }

  getAuditRetentionDays(): number {
    return this.config.get<number>('AUDIT_RETENTION_DAYS', 90);
  }
}
