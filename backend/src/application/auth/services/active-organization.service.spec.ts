import { ActiveOrganizationService } from './active-organization.service';

describe('ActiveOrganizationService', () => {
  const users = { findById: jest.fn(), update: jest.fn() };
  const organizations = {
    listOrganizationsForUser: jest.fn(),
    userHasMembership: jest.fn(),
  };

  it('returns stored organization when membership is valid', async () => {
    users.findById.mockResolvedValue({ id: 1, organizationId: 5 });
    organizations.userHasMembership.mockResolvedValue(true);
    const service = new ActiveOrganizationService(
      users as never,
      organizations as never,
    );
    await expect(service.resolveOrganizationId(1)).resolves.toBe(5);
  });

  it('ignores invalid stored organization', async () => {
    users.findById.mockResolvedValue({ id: 1, organizationId: 5 });
    organizations.userHasMembership.mockResolvedValue(false);
    organizations.listOrganizationsForUser.mockResolvedValue([{ id: 2 }]);
    users.update.mockResolvedValue(undefined);
    const service = new ActiveOrganizationService(
      users as never,
      organizations as never,
    );
    await expect(service.resolveOrganizationId(1)).resolves.toBe(2);
  });

  it('falls back to first membership', async () => {
    users.findById.mockResolvedValue({ id: 1, organizationId: null });
    organizations.listOrganizationsForUser.mockResolvedValue([{ id: 9 }]);
    users.update.mockResolvedValue(undefined);
    const service = new ActiveOrganizationService(
      users as never,
      organizations as never,
    );
    await expect(service.resolveOrganizationId(1)).resolves.toBe(9);
    expect(users.update).toHaveBeenCalledWith(1, { organizationId: 9 });
  });
});
