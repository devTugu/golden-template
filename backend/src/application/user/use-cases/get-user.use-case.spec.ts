import { GetUserUseCase } from './get-user.use-case';

describe('GetUserUseCase', () => {
  const users = { findById: jest.fn() };
  const orgContext = { getCurrentOrganizationId: jest.fn() };
  const useCase = new GetUserUseCase(users as never, orgContext);

  beforeEach(() => {
    orgContext.getCurrentOrganizationId.mockResolvedValue(1);
  });

  it('throws when user not found', async () => {
    users.findById.mockResolvedValue(null);
    await expect(useCase.execute(1)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws when user belongs to another organization', async () => {
    users.findById.mockResolvedValue({
      id: 2,
      email: 'a@b.com',
      organizationId: 99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleNames: ['ADMIN'],
    });
    await expect(useCase.execute(2)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('returns user output', async () => {
    users.findById.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      organizationId: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleNames: ['ADMIN'],
    });
    const result = await useCase.execute(1);
    expect(result.email).toBe('a@b.com');
    expect(result.roles).toEqual(['ADMIN']);
  });
});
