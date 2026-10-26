import type { CreateRoleInput } from '@default/types/role';
import { IRoleRepository } from '@domain/authorization/repositories/role.repository.interface';
import { AppErrors } from '@application/exceptions/application.exception';

export class CreateRoleUseCase {
  constructor(private readonly roles: IRoleRepository) {}

  async execute(input: CreateRoleInput) {
    const name = input.name.toUpperCase();
    if (await this.roles.nameExists(name)) {
      throw AppErrors.CONFLICT('Role name already exists.');
    }
    return this.roles.create({
      name,
      description: input.description,
      permissionIds: input.permissionIds,
    });
  }
}
