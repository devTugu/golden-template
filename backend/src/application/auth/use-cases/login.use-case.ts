import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { TokenPair } from '@shared/types/pagination';
import { LoginResult } from '../dto/login-result';
import { roleRequiresMfa } from '../lib/mfa-required-roles';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';
import { MfaPolicyService } from '../services/mfa-policy.service';
import type { ClientRequestMeta } from '../dto/client-request-meta';
import { RecordRefreshTokenService } from '../services/record-refresh-token.service';
import { ActiveOrganizationService } from '../services/active-organization.service';

export class LoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly recordRefresh: RecordRefreshTokenService,
    private readonly tokens: ITokenIssuer,
    private readonly permissionCache: IPermissionCache,
    private readonly runtimeConfig: IRuntimeConfig,
    private readonly mfaPolicy: MfaPolicyService,
    private readonly activeOrganization: ActiveOrganizationService,
  ) {}

  async execute(
    email: string,
    password: string,
    meta?: ClientRequestMeta,
  ): Promise<LoginResult> {
    const lockState = await this.users.getLoginLockState(email);
    if (!lockState || !lockState.passwordHash) {
      throw AppErrors.UNAUTHORIZED('Invalid email or password.');
    }

    if (lockState.lockedUntil && lockState.lockedUntil.getTime() > Date.now()) {
      throw AppErrors.TOO_MANY_REQUESTS(
        'Account temporarily locked due to too many failed login attempts.',
      );
    }

    const valid = await this.hasher.compare(password, lockState.passwordHash);
    if (!valid) {
      const maxAttempts = this.runtimeConfig.getLoginMaxFailedAttempts();
      const lockoutMinutes = this.runtimeConfig.getLoginLockoutMinutes();
      const nextAttempts = lockState.failedLoginAttempts + 1;
      const lockedUntil =
        nextAttempts >= maxAttempts
          ? new Date(Date.now() + lockoutMinutes * 60_000)
          : undefined;
      await this.users.recordFailedLogin(lockState.userId, lockedUntil);
      throw AppErrors.UNAUTHORIZED('Invalid email or password.');
    }

    await this.users.clearFailedLogin(lockState.userId);

    const user = await this.users.findByEmailWithRolesAndPermissions(email);
    if (!user || !user.passwordHash) {
      throw AppErrors.UNAUTHORIZED('Invalid email or password.');
    }

    const requiredRoles = await this.mfaPolicy.getRequiredRoles();
    const privilegedRole = roleRequiresMfa(user.roleNames, requiredRoles);

    if (user.mfaEnabled) {
      const mfaToken = await this.tokens.issueMfaPendingToken(user.id);
      return { requiresMfa: true, mfaToken };
    }

    if (privilegedRole) {
      const enrollmentToken = await this.tokens.issueMfaEnrollmentPendingToken(
        user.id,
      );
      return { requiresMfaEnrollment: true, enrollmentToken };
    }

    await this.warmPermissionCache(
      user.id,
      user.roleNames,
      user.permissionCodes,
    );
    return this.issueTokens(user.id, user.email, meta);
  }

  private async warmPermissionCache(
    userId: number,
    roleNames: string[],
    permissionCodes: string[],
  ): Promise<void> {
    const ttl = this.runtimeConfig.getPermissionCacheTtlSec();
    await this.permissionCache.set(userId, { roleNames, permissionCodes }, ttl);
  }

  private async issueTokens(
    userId: number,
    email: string,
    meta?: ClientRequestMeta,
  ): Promise<TokenPair> {
    const organizationId =
      await this.activeOrganization.resolveOrganizationId(userId);
    const issued = await this.tokens.issuePair(userId, email, organizationId);
    await this.recordRefresh.record(
      userId,
      issued.refreshToken,
      issued.refreshExpiresAt,
      meta,
    );
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      expiresIn: issued.accessExpiresIn,
    };
  }
}
