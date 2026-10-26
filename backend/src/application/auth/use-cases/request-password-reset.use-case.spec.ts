import { RequestPasswordResetUseCase } from './request-password-reset.use-case';

describe('RequestPasswordResetUseCase', () => {
  it('does nothing when email is unknown', async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(null) };
    const authTokens = {
      invalidateActiveForUser: jest.fn(),
      create: jest.fn(),
    };
    const notifications = { sendPasswordResetEmail: jest.fn() };
    const config = { get: jest.fn().mockReturnValue(60) };

    const useCase = new RequestPasswordResetUseCase(
      users as never,
      authTokens as never,
      notifications as never,
      config as never,
    );

    await expect(
      useCase.execute('missing@example.com'),
    ).resolves.toBeUndefined();
    expect(authTokens.create).not.toHaveBeenCalled();
  });

  it('creates token and sends email when user exists', async () => {
    const users = {
      findByEmail: jest
        .fn()
        .mockResolvedValue({ id: 3, email: 'u@example.com' }),
    };
    const authTokens = {
      invalidateActiveForUser: jest.fn(),
      create: jest.fn(),
    };
    const notifications = { sendPasswordResetEmail: jest.fn() };
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'PASSWORD_RESET_TTL_MINUTES') return 30;
        if (key === 'CORS_ORIGIN') return 'http://localhost:3000';
        return undefined;
      }),
    };

    const useCase = new RequestPasswordResetUseCase(
      users as never,
      authTokens as never,
      notifications as never,
      config as never,
    );

    await useCase.execute('u@example.com');
    expect(authTokens.invalidateActiveForUser).toHaveBeenCalledWith(
      3,
      'password_reset',
    );
    expect(notifications.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'u@example.com',
        resetUrl: expect.stringContaining('/reset-password?token='),
      }),
    );
  });
});
