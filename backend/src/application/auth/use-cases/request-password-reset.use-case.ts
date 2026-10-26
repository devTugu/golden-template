import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { INotificationPort } from '@application/ports/notification.port';
import { IAuthTokenRepository } from '@application/ports/auth-token.port';
import {
  AUTH_TOKEN_REPOSITORY,
  NOTIFICATION_PORT,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import {
  generateAuthTokenRaw,
  hashAuthToken,
} from '@shared/utils/auth-token.util';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(AUTH_TOKEN_REPOSITORY)
    private readonly authTokens: IAuthTokenRepository,
    @Inject(NOTIFICATION_PORT)
    private readonly notifications: INotificationPort,
    private readonly config: ConfigService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;

    const ttlMin = this.config.get<number>('PASSWORD_RESET_TTL_MINUTES', 60);
    const raw = generateAuthTokenRaw();
    const tokenHash = hashAuthToken(raw);
    await this.authTokens.invalidateActiveForUser(user.id, 'password_reset');
    await this.authTokens.create({
      userId: user.id,
      type: 'password_reset',
      tokenHash,
      expiresAt: new Date(Date.now() + ttlMin * 60_000),
    });

    const base = this.config.get<string>(
      'CORS_ORIGIN',
      'http://localhost:3000',
    );
    const resetUrl = `${base.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(raw)}`;
    await this.notifications.sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });
  }
}
