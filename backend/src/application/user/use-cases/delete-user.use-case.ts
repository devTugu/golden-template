import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { AppErrors } from '@application/exceptions/application.exception';

export class DeleteUserUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly cache: IPermissionCache,
  ) {}

  async execute(id: number): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) throw AppErrors.NOT_FOUND('User not found.');
    await this.users.softDelete(id);
    await this.cache.invalidate(id);
  }
}
