import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IRoleRepository } from '@domain/authorization/repositories/role.repository.interface';
import { IPermissionRepository } from '@domain/authorization/repositories/permission.repository.interface';
import { DashboardStatsOutput } from '../dto/dashboard-stats.output';

const PERMISSION_MAP = {
  users: 'USER_READ',
  roles: 'ROLE_READ',
  permissions: 'PERMISSION_READ',
} as const;

export class GetDashboardStatsUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly roles: IRoleRepository,
    private readonly permissions: IPermissionRepository,
  ) {}

  async execute(permissionCodes: string[]): Promise<DashboardStatsOutput> {
    const allowed = new Set(permissionCodes);
    const stats: DashboardStatsOutput = {};
    const tasks: Promise<void>[] = [];

    if (allowed.has(PERMISSION_MAP.users)) {
      tasks.push(
        this.users.findAll({ page: 1, limit: 1 }).then((result) => {
          stats.users = result.total;
        }),
      );
    }

    if (allowed.has(PERMISSION_MAP.roles)) {
      tasks.push(
        this.roles.findAll(1, 1).then((result) => {
          stats.roles = result.total;
        }),
      );
    }

    if (allowed.has(PERMISSION_MAP.permissions)) {
      tasks.push(
        this.permissions.findAll(1, 1).then((result) => {
          stats.permissions = result.total;
        }),
      );
    }

    await Promise.all(tasks);
    return stats;
  }
}
