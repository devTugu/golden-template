import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IOrganizationContext } from '@application/ports/organization-context.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { UserOutput } from '@application/dto/user.dto';
import { toUserOutput } from '@application/dto/user-output.mapper';

export class GetUserUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly orgContext: IOrganizationContext,
  ) {}

  async execute(id: number): Promise<UserOutput> {
    const user = await this.users.findById(id);
    if (!user) throw AppErrors.NOT_FOUND('User not found.');

    const organizationId = await this.orgContext.getCurrentOrganizationId();
    if (
      organizationId !== null &&
      user.organizationId !== null &&
      user.organizationId !== organizationId
    ) {
      throw AppErrors.NOT_FOUND('User not found.');
    }

    return toUserOutput(user);
  }
}
