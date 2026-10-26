import * as crypto from 'crypto';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import {
  mergeSessionMeta,
  type ClientRequestMeta,
} from '../dto/client-request-meta';
import { RecordRefreshTokenService } from '../services/record-refresh-token.service';
import { IRefreshTokenRepository } from '@domain/auth/repositories/refresh-token.repository.interface';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { TokenPair } from '@shared/types/pagination';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';
import { ActiveOrganizationService } from '../services/active-organization.service';

export class RefreshTokenUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
    private readonly tokens: ITokenIssuer,
    private readonly permissionCache: IPermissionCache,
    private readonly runtimeConfig: IRuntimeConfig,
    private readonly recordRefresh: RecordRefreshTokenService,
    private readonly activeOrganization: ActiveOrganizationService,
  ) {}

  async execute(
    refreshTokenRaw: string,
    meta?: ClientRequestMeta,
  ): Promise<TokenPair> {
    let payload: { sub: number; type: string };
    try {
      payload = await this.tokens.verifyRefresh(refreshTokenRaw);
    } catch {
      throw AppErrors.UNAUTHORIZED('Invalid or expired refresh token.');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');
    const stored = await this.refreshTokens.findByUserAndHash(
      payload.sub,
      tokenHash,
    );

    if (!stored) {
      await this.refreshTokens.revokeAllForUser(payload.sub);
      throw AppErrors.UNAUTHORIZED(
        'Refresh token reuse detected. All sessions revoked.',
      );
    }

    if (stored.revokedAt || new Date() > stored.expiresAt) {
      await this.refreshTokens.revokeAllForUser(payload.sub);
      throw AppErrors.UNAUTHORIZED(
        'Refresh token reuse detected. All sessions revoked.',
      );
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) {
      throw AppErrors.UNAUTHORIZED('User is inactive or not found.');
    }

    await this.refreshTokens.revokeById(stored.id);

    const fullUser = await this.users.findByEmailWithRolesAndPermissions(
      user.email,
    );
    if (fullUser) {
      const ttl = this.runtimeConfig.getPermissionCacheTtlSec();
      await this.permissionCache.set(
        fullUser.id,
        {
          roleNames: fullUser.roleNames,
          permissionCodes: fullUser.permissionCodes,
        },
        ttl,
      );
    }

    const organizationId = await this.activeOrganization.resolveOrganizationId(
      user.id,
    );
    const issued = await this.tokens.issuePair(
      user.id,
      user.email,
      organizationId,
    );
    const persistedMeta = mergeSessionMeta(meta, stored);
    await this.recordRefresh.record(
      user.id,
      issued.refreshToken,
      issued.refreshExpiresAt,
      persistedMeta,
    );

    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      expiresIn: issued.accessExpiresIn,
    };
  }
}
