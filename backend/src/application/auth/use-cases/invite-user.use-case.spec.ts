import { InviteUserUseCase } from './invite-user.use-case';

describe('InviteUserUseCase', () => {
  const users = {
    emailExists: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 9, email: 'new@example.com' }),
  };
  const hasher = { hash: jest.fn().mockResolvedValue('placeholder-hash') };
  const authTokens = { create: jest.fn() };
  const notifications = { sendInviteEmail: jest.fn() };
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'INVITE_TTL_HOURS') return 48;
      if (key === 'CORS_ORIGIN') return 'http://localhost:3000/';
      return undefined;
    }),
  };

  beforeEach(() => jest.clearAllMocks());

  it('rejects duplicate email', async () => {
    users.emailExists.mockResolvedValue(true);
    const useCase = new InviteUserUseCase(
      users as never,
      hasher as never,
      authTokens as never,
      notifications as never,
      config as never,
    );
    await expect(
      useCase.execute({ email: 'dup@example.com', invitedByUserId: 1 }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates inactive user and sends invite email', async () => {
    users.emailExists.mockResolvedValue(false);
    const useCase = new InviteUserUseCase(
      users as never,
      hasher as never,
      authTokens as never,
      notifications as never,
      config as never,
    );
    await useCase.execute({ email: 'new@example.com', invitedByUserId: 2 });
    expect(authTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 9, type: 'invite', createdBy: 2 }),
    );
    expect(notifications.sendInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@example.com',
        inviteUrl: expect.stringContaining('/accept-invite?token='),
      }),
    );
  });
});
