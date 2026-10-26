import { Inject, Injectable } from '@nestjs/common';
import { PasswordPolicy } from '@domain/user/value-objects/password-policy.vo';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IRefreshTokenRepository } from '@domain/auth/repositories/refresh-token.repository.interface';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { IAuthTokenRepository } from '@application/ports/auth-token.port';
import { AppErrors } from '@application/exceptions/application.exception';
import {
  AUTH_TOKEN_REPOSITORY,
  PASSWORD_HASHER,
  REFRESH_TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import { hashAuthToken } from '@shared/utils/auth-token.util';

const INVALID_TOKEN_MESSAGE = 'Invalid or expired reset link.';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(AUTH_TOKEN_REPOSITORY)
    private readonly authTokens: IAuthTokenRepository,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    try {
      PasswordPolicy.validate(newPassword);
    } catch (error) {
      throw AppErrors.BAD_REQUEST(
        error instanceof Error ? error.message : 'Invalid password.',
      );
    }

    const record = await this.authTokens.findValidByHash(hashAuthToken(token));
    if (!record || record.type !== 'password_reset') {
      throw AppErrors.BAD_REQUEST(INVALID_TOKEN_MESSAGE);
    }

    const passwordHash = await this.hasher.hash(newPassword);
    await this.users.update(record.userId, { passwordHash });
    await this.users.clearFailedLogin(record.userId);
    await this.refreshTokens.revokeAllForUser(record.userId);
    await this.authTokens.markUsed(record.id, new Date());
  }
}
