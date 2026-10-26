import { ResetPasswordUseCase } from './reset-password.use-case';

describe('ResetPasswordUseCase', () => {
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
});
