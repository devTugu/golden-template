import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { IMfaVerifier } from '@application/ports/identity.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { TokenPair } from '@shared/types/pagination';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';
import type { ClientRequestMeta } from '../dto/client-request-meta';
import { RecordRefreshTokenService } from '../services/record-refresh-token.service';
import { ActiveOrganizationService } from '../services/active-organization.service';

export class VerifyMfaLoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokens: ITokenIssuer,
    private readonly recordRefresh: RecordRefreshTokenService,
    private readonly permissionCache: IPermissionCache,
    private readonly mfa: IMfaVerifier,
    private readonly runtimeConfig: IRuntimeConfig,
    private readonly activeOrganization: ActiveOrganizationService,
  ) {}

  async execute(
    mfaToken: string,
    code: string,
    meta?: ClientRequestMeta,
  ): Promise<TokenPair> {
    const claims = await this.tokens.verifyMfaPending(mfaToken);
    const userRecord = await this.users.findById(claims.sub);
    if (!userRecord) throw AppErrors.UNAUTHORIZED('Invalid MFA session.');

    const user = await this.users.findByEmailWithRolesAndPermissions(
      userRecord.email,
    );
    if (!user) throw AppErrors.UNAUTHORIZED('Invalid MFA session.');

    const encrypted = await this.users.getMfaSecretEncrypted(user.id);
    if (!encrypted) throw AppErrors.UNAUTHORIZED('MFA not configured.');

    const secret = this.mfa.decryptSecret(encrypted);
    if (!this.mfa.verifyToken(secret, code)) {
      throw AppErrors.UNAUTHORIZED('Invalid MFA code.');
    }

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
