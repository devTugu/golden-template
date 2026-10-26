import {
  AddOrganizationMemberUseCase,
  CreateOrganizationUseCase,
  ListMyOrganizationsUseCase,
  ListOrganizationMembersUseCase,
  ListOrganizationsUseCase,
  SwitchOrganizationUseCase,
  UpdateOrganizationUseCase,
} from './organization.use-cases';

describe('Organization use cases', () => {
  const organizations = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    addMember: jest.fn(),
    listMembers: jest.fn(),
    listOrganizationsForUser: jest.fn(),
    userHasMembership: jest.fn(),
  };

  it('ListOrganizationsUseCase maps timestamps', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    organizations.findAll.mockResolvedValue({
      items: [{ id: 1, slug: 'a', name: 'A', createdAt, updatedAt: createdAt }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    const useCase = new ListOrganizationsUseCase(organizations);
    const result = await useCase.execute(1, 20);
    expect(result.items[0].createdAt).toBe(createdAt.toISOString());
  });

  it('CreateOrganizationUseCase rejects duplicate slug', async () => {
    organizations.findBySlug.mockResolvedValue({ id: 1 });
    const useCase = new CreateOrganizationUseCase(organizations);
    await expect(
      useCase.execute({ slug: 'dup', name: 'Dup' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('CreateOrganizationUseCase creates org', async () => {
    const createdAt = new Date();
    organizations.findBySlug.mockResolvedValue(null);
    organizations.create.mockResolvedValue({
      id: 2,
      slug: 'new',
      name: 'New',
      createdAt,
      updatedAt: createdAt,
    });
    const useCase = new CreateOrganizationUseCase(organizations);
    const result = await useCase.execute({ slug: 'new', name: 'New' });
    expect(result.slug).toBe('new');
  });

  it('UpdateOrganizationUseCase throws when missing', async () => {
    organizations.findById.mockResolvedValue(null);
    const useCase = new UpdateOrganizationUseCase(organizations);
    await expect(useCase.execute(1, { name: 'X' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('AddOrganizationMemberUseCase adds member', async () => {
    const createdAt = new Date();
    organizations.findById.mockResolvedValue({ id: 1 });
    organizations.addMember.mockResolvedValue({
      id: 1,
      organizationId: 1,
      userId: 2,
      userEmail: 'u@example.com',
      role: 'member',
      createdAt,
    });
    const useCase = new AddOrganizationMemberUseCase(organizations);
    const result = await useCase.execute(1, 2, 'member');
    expect(result.userEmail).toBe('u@example.com');
  });

  it('ListOrganizationMembersUseCase delegates to repository', async () => {
    organizations.listMembers.mockResolvedValue({ items: [] });
    const useCase = new ListOrganizationMembersUseCase(organizations);
    await useCase.execute(1, 1, 10);
    expect(organizations.listMembers).toHaveBeenCalledWith(1, 1, 10);
  });

  it('ListMyOrganizationsUseCase lists memberships', async () => {
    const createdAt = new Date();
    organizations.listOrganizationsForUser.mockResolvedValue([
      { id: 1, slug: 'a', name: 'A', createdAt, updatedAt: createdAt },
    ]);
    const useCase = new ListMyOrganizationsUseCase(organizations);
    const result = await useCase.execute(7);
    expect(result).toHaveLength(1);
  });

  it('SwitchOrganizationUseCase forbids non-members', async () => {
    organizations.userHasMembership.mockResolvedValue(false);
    const useCase = new SwitchOrganizationUseCase(
      {} as never,
      organizations,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(useCase.execute(1, 99)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('SwitchOrganizationUseCase issues tokens for members', async () => {
    organizations.userHasMembership.mockResolvedValue(true);
    const users = {
      update: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: 1, email: 'a@b.com' }),
    };
    const tokens = {
      issuePair: jest.fn().mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
        accessExpiresIn: 60,
        refreshExpiresAt: new Date(),
      }),
    };
    const recordRefresh = { record: jest.fn() };
    const activeOrganization = {
      resolveOrganizationId: jest.fn().mockResolvedValue(3),
    };
    const useCase = new SwitchOrganizationUseCase(
      users as never,
      organizations,
      tokens as never,
      recordRefresh as never,
      activeOrganization as never,
    );
    const result = await useCase.execute(1, 3);
    expect(result.accessToken).toBe('a');
    expect(users.update).toHaveBeenCalledWith(1, { organizationId: 3 });
  });
});
