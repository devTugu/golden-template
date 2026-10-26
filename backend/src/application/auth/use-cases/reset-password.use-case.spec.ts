import { ResetPasswordUseCase } from './reset-password.use-case';
import { hashAuthToken } from '@shared/utils/auth-token.util';

describe('ResetPasswordUseCase', () => {
  const rawToken = 'reset-token-value-long-enough';

  it('rejects invalid token hash', async () => {
    const authTokens = { findValidByHash: jest.fn().mockResolvedValue(null) };
    const useCase = new ResetPasswordUseCase(
      authTokens as never,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(
      useCase.execute('bad-token-value', 'ValidPass1!'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('updates password and revokes sessions on valid token', async () => {
    const authTokens = {
      findValidByHash: jest.fn().mockResolvedValue({
        id: 2,
        userId: 7,
        type: 'password_reset',
      }),
      markUsed: jest.fn(),
    };
    const users = {
      update: jest.fn(),
      clearFailedLogin: jest.fn(),
    };
    const hasher = { hash: jest.fn().mockResolvedValue('hashed') };
    const refreshTokens = { revokeAllForUser: jest.fn() };
    const useCase = new ResetPasswordUseCase(
      authTokens as never,
      users as never,
      hasher as never,
      refreshTokens as never,
    );

    await useCase.execute(rawToken, 'ValidPass1!');
    expect(authTokens.findValidByHash).toHaveBeenCalledWith(
      hashAuthToken(rawToken),
    );
    expect(users.update).toHaveBeenCalledWith(7, { passwordHash: 'hashed' });
    expect(users.clearFailedLogin).toHaveBeenCalledWith(7);
    expect(refreshTokens.revokeAllForUser).toHaveBeenCalledWith(7);
    expect(authTokens.markUsed).toHaveBeenCalled();
  });
});
