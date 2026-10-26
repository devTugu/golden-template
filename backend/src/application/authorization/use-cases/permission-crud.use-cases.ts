import { IPermissionRepository } from '@domain/authorization/repositories/permission.repository.interface';
import { AppErrors } from '@application/exceptions/application.exception';
import { PaginatedResult } from '@shared/types/pagination';
import { Permission } from '@domain/authorization/entities/permission.entity';

export class CreatePermissionUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  async execute(code: string, description?: string): Promise<Permission> {
    const normalized = code.toUpperCase();
    if (await this.permissions.codeExists(normalized)) {
      throw AppErrors.CONFLICT('Permission code already exists.');
    }
    return this.permissions.create(normalized, description);
  }
}

export class ListPermissionsUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  execute(page = 1, limit = 20): Promise<PaginatedResult<Permission>> {
    return this.permissions.findAll(page, limit);
  }
}

export class GetPermissionUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  async execute(id: number): Promise<Permission> {
    const permission = await this.permissions.findById(id);
    if (!permission) throw AppErrors.NOT_FOUND('Permission not found.');
    return permission;
  }
}

export class UpdatePermissionUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  async execute(id: number, description?: string): Promise<Permission> {
    const existing = await this.permissions.findById(id);
    if (!existing) throw AppErrors.NOT_FOUND('Permission not found.');
    return this.permissions.update(id, description);
  }
}

export class DeletePermissionUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.permissions.findById(id);
    if (!existing) throw AppErrors.NOT_FOUND('Permission not found.');
    await this.permissions.delete(id);
  }
}
