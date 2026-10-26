import { IOrganizationRepository } from '@domain/organization/repositories/organization.repository.interface';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { AppErrors } from '@application/exceptions/application.exception';

export class ActiveOrganizationService {
  constructor(
    private readonly users: IUserRepository,
    private readonly organizations: IOrganizationRepository,
  ) {}

  async resolveOrganizationId(userId: number): Promise<number> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw AppErrors.UNAUTHORIZED('User not found.');
    }

    if (user.organizationId) {
      const allowed = await this.organizations.userHasMembership(
        userId,
        user.organizationId,
      );
      if (allowed) {
        return user.organizationId;
      }
    }

    const memberships =
      await this.organizations.listOrganizationsForUser(userId);
    if (memberships.length === 0) {
      throw AppErrors.FORBIDDEN('No organization membership.');
    }

    const organizationId = memberships[0].id;
    await this.users.update(userId, { organizationId });
    return organizationId;
  }
}
