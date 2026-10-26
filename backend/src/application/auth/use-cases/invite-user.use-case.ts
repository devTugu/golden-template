import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Email } from '@domain/value-objects/email.vo';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { INotificationPort } from '@application/ports/notification.port';
import { IAuthTokenRepository } from '@application/ports/auth-token.port';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { AppErrors } from '@application/exceptions/application.exception';
import {
  AUTH_TOKEN_REPOSITORY,
  NOTIFICATION_PORT,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import {
  generateAuthTokenRaw,
  hashAuthToken,
} from '@shared/utils/auth-token.util';

@Injectable()
export class InviteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(AUTH_TOKEN_REPOSITORY)
    private readonly authTokens: IAuthTokenRepository,
    @Inject(NOTIFICATION_PORT)
    private readonly notifications: INotificationPort,
    private readonly config: ConfigService,
  ) {}

  async execute(input: {
    email: string;
    invitedByUserId: number;
  }): Promise<void> {
    const email = Email.create(input.email);
    if (await this.users.emailExists(email.value)) {
      throw AppErrors.CONFLICT('Email is already registered.');
    }

    const placeholder = await this.hasher.hash(generateAuthTokenRaw());
    const user = await this.users.create({
      email: email.value,
      passwordHash: placeholder,
      isActive: false,
    });

    const hours = this.config.get<number>('INVITE_TTL_HOURS', 72);
    const raw = generateAuthTokenRaw();
    await this.authTokens.create({
      userId: user.id,
      type: 'invite',
      tokenHash: hashAuthToken(raw),
      expiresAt: new Date(Date.now() + hours * 3_600_000),
      createdBy: input.invitedByUserId,
    });

    const base = this.config.get<string>(
      'CORS_ORIGIN',
      'http://localhost:3000',
    );
    const inviteUrl = `${base.replace(/\/$/, '')}/accept-invite?token=${encodeURIComponent(raw)}`;
    await this.notifications.sendInviteEmail({
      to: email.value,
      inviteUrl,
    });
  }
}
