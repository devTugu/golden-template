import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IMfaVerifier } from '@application/ports/identity.port';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { TokenPair } from '@shared/types/pagination';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';
import type { ClientRequestMeta } from '../dto/client-request-meta';
import { RecordRefreshTokenService } from '../services/record-refresh-token.service';
import { ActiveOrganizationService } from '../services/active-organization.service';

export class ConfirmMfaEnrollUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly mfa: IMfaVerifier,
  ) {}

  async execute(userId: number, code: string): Promise<void> {
    const encrypted = await this.users.getMfaSecretEncrypted(userId);
    if (!encrypted) throw AppErrors.BAD_REQUEST('Start MFA enrollment first.');

    const secret = this.mfa.decryptSecret(encrypted);
    if (!this.mfa.verifyToken(secret, code)) {
      throw AppErrors.UNAUTHORIZED('Invalid MFA code.');
    }

    await this.users.update(userId, { mfaEnabled: true });
  }
}

export class ConfirmMfaEnrollWithEnrollmentTokenUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly mfa: IMfaVerifier,
    private readonly tokens: ITokenIssuer,
    private readonly permissionCache: IPermissionCache,
    private readonly runtimeConfig: IRuntimeConfig,
    private readonly recordRefresh: RecordRefreshTokenService,
    private readonly activeOrganization: ActiveOrganizationService,
  ) {}

  async execute(
    enrollmentToken: string,
    code: string,
    meta?: ClientRequestMeta,
  ): Promise<TokenPair> {
    const claims =
      await this.tokens.verifyMfaEnrollmentPending(enrollmentToken);
    const encrypted = await this.users.getMfaSecretEncrypted(claims.sub);
    if (!encrypted) {
      throw AppErrors.BAD_REQUEST('Start MFA enrollment first.');
    }

    const secret = this.mfa.decryptSecret(encrypted);
    if (!this.mfa.verifyToken(secret, code)) {
      throw AppErrors.UNAUTHORIZED('Invalid MFA code.');
    }

    await this.users.update(claims.sub, { mfaEnabled: true });

    const user = await this.users.findByEmailWithRolesAndPermissions(
      (await this.users.findById(claims.sub))!.email,
    );
    if (!user) throw AppErrors.UNAUTHORIZED('User not found.');

    const ttl = this.runtimeConfig.getPermissionCacheTtlSec();
    await this.permissionCache.set(
      user.id,
      { roleNames: user.roleNames, permissionCodes: user.permissionCodes },
      ttl,
    );

    const organizationId = await this.activeOrganization.resolveOrganizationId(
      user.id,
    );
    const issued = await this.tokens.issuePair(
      user.id,
      user.email,
      organizationId,
    );
    await this.recordRefresh.record(
      user.id,
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
