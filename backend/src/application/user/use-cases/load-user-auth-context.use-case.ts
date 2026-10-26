import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import {
  IPermissionCache,
  UserAuthContext,
} from '@application/ports/permission-cache.port';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';

export class LoadUserAuthContextUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly cache: IPermissionCache,
    private readonly runtimeConfig: IRuntimeConfig,
  ) {}

  async execute(userId: number): Promise<UserAuthContext | null> {
    const cached = await this.cache.get(userId);
    if (cached) return cached;

    const user = await this.users.findById(userId);
    if (!user || !user.isActive) return null;

    const context: UserAuthContext = {
      roleNames: user.roleNames,
      permissionCodes: user.permissionCodes,
    };
    const ttl = this.runtimeConfig.getPermissionCacheTtlSec();
    await this.cache.set(userId, context, ttl);
    return context;
  }
}
