import { AcceptInviteUseCase } from './accept-invite.use-case';
import { hashAuthToken } from '@shared/utils/auth-token.util';

describe('AcceptInviteUseCase', () => {
  const rawToken = 'invite-token-value-long-enough';

  it('rejects invalid invite token', async () => {
    const useCase = new AcceptInviteUseCase(
      { findValidByHash: jest.fn().mockResolvedValue(null) } as never,
      {} as never,
      {} as never,
    );
    await expect(useCase.execute('short', 'ValidPass1!')).rejects.toMatchObject(
      { statusCode: 400 },
    );
  });

  it('rejects weak password', async () => {
    const useCase = new AcceptInviteUseCase(
      { findValidByHash: jest.fn() } as never,
      {} as never,
      {} as never,
    );
    await expect(useCase.execute(rawToken, 'weak')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('activates user on valid invite', async () => {
    const authTokens = {
      findValidByHash: jest.fn().mockResolvedValue({
        id: 1,
        userId: 5,
        type: 'invite',
      }),
      markUsed: jest.fn(),
    };
    const users = { update: jest.fn() };
    const hasher = { hash: jest.fn().mockResolvedValue('new-hash') };
    const useCase = new AcceptInviteUseCase(
      authTokens as never,
      users as never,
      hasher as never,
    );

    await useCase.execute(rawToken, 'ValidPass1!');
    expect(authTokens.findValidByHash).toHaveBeenCalledWith(
      hashAuthToken(rawToken),
    );
    expect(users.update).toHaveBeenCalledWith(5, {
      passwordHash: 'new-hash',
      isActive: true,
    });
    expect(authTokens.markUsed).toHaveBeenCalled();
  });
});
