import { Inject, Injectable } from '@nestjs/common';
import { PasswordPolicy } from '@domain/user/value-objects/password-policy.vo';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { IAuthTokenRepository } from '@application/ports/auth-token.port';
import { AppErrors } from '@application/exceptions/application.exception';
import {
  AUTH_TOKEN_REPOSITORY,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import { hashAuthToken } from '@shared/utils/auth-token.util';

const INVALID_TOKEN_MESSAGE = 'Invalid or expired invite link.';

@Injectable()
export class AcceptInviteUseCase {
  constructor(
    @Inject(AUTH_TOKEN_REPOSITORY)
    private readonly authTokens: IAuthTokenRepository,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async execute(token: string, password: string): Promise<void> {
    try {
      PasswordPolicy.validate(password);
    } catch (error) {
      throw AppErrors.BAD_REQUEST(
        error instanceof Error ? error.message : 'Invalid password.',
      );
    }

    const record = await this.authTokens.findValidByHash(hashAuthToken(token));
    if (!record || record.type !== 'invite') {
      throw AppErrors.BAD_REQUEST(INVALID_TOKEN_MESSAGE);
    }

    const passwordHash = await this.hasher.hash(password);
    await this.users.update(record.userId, {
      passwordHash,
      isActive: true,
    });
    await this.authTokens.markUsed(record.id, new Date());
  }
}
