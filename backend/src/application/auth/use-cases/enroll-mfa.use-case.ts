import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IMfaVerifier } from '@application/ports/identity.port';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { AppErrors } from '@application/exceptions/application.exception';

export class EnrollMfaUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly mfa: IMfaVerifier,
  ) {}

  async execute(userId: number): Promise<{ otpauthUrl: string }> {
    const user = await this.users.findById(userId);
    if (!user) throw AppErrors.NOT_FOUND('User not found.');

    const { secret, otpauthUrl } = this.mfa.generateSecret(user.email);
    await this.users.update(userId, {
      mfaSecretEncrypted: this.mfa.encryptSecret(secret),
      mfaEnabled: false,
    });

    return { otpauthUrl };
  }
}

export class EnrollMfaWithEnrollmentTokenUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly mfa: IMfaVerifier,
    private readonly tokens: ITokenIssuer,
  ) {}

  async execute(enrollmentToken: string): Promise<{ otpauthUrl: string }> {
    const claims =
      await this.tokens.verifyMfaEnrollmentPending(enrollmentToken);
    const user = await this.users.findById(claims.sub);
    if (!user) throw AppErrors.NOT_FOUND('User not found.');

    const { secret, otpauthUrl } = this.mfa.generateSecret(user.email);
    await this.users.update(claims.sub, {
      mfaSecretEncrypted: this.mfa.encryptSecret(secret),
      mfaEnabled: false,
    });

    return { otpauthUrl };
  }
}
