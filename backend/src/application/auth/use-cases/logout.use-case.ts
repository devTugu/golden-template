import * as crypto from 'crypto';
import { IRefreshTokenRepository } from '@domain/auth/repositories/refresh-token.repository.interface';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { ITokenBlacklist } from '@application/ports/token-blacklist.port';

export class LogoutUseCase {
  constructor(
    private readonly refreshTokens: IRefreshTokenRepository,
    private readonly tokens: ITokenIssuer,
    private readonly blacklist: ITokenBlacklist,
  ) {}

  async execute(
    accessToken: string | undefined,
    refreshTokenRaw: string,
  ): Promise<void> {
    if (accessToken) {
      const decoded = this.tokens.decodeAccess(accessToken);
      if (decoded?.jti && decoded?.exp) {
        await this.blacklist.revoke(decoded.jti, decoded.exp);
      }
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');
    const stored = await this.refreshTokens.findByHash(tokenHash);
    if (stored && !stored.revokedAt) {
      await this.refreshTokens.revokeById(stored.id);
    }
  }
}
