import { ListAuditLogsUseCase } from '@application/audit/use-cases/list-audit-logs.use-case';
import { PurgeAuditLogsUseCase } from '@application/audit/use-cases/purge-audit-logs.use-case';
import { CreateRoleUseCase } from '@application/authorization/use-cases/create-role.use-case';
import {
  AssignRoleToUserUseCase,
  DeleteRoleUseCase,
  GetRoleUseCase,
  ListRolesUseCase,
  RemoveRoleFromUserUseCase,
  UpdateRoleUseCase,
} from '@application/authorization/use-cases/role-crud.use-cases';
import {
  CreatePermissionUseCase,
  DeletePermissionUseCase,
  GetPermissionUseCase,
  ListPermissionsUseCase,
  UpdatePermissionUseCase,
} from '@application/authorization/use-cases/permission-crud.use-cases';
import { GetDashboardStatsUseCase } from '@application/dashboard/use-cases/get-dashboard-stats.use-case';
import { UploadMediaUseCase } from '@application/media/use-cases/upload-media.use-case';
import {
  GetPublicSiteSettingsUseCase,
  GetSiteSettingsUseCase,
  UpdateSiteSettingsUseCase,
} from '@application/site-setting/use-cases/site-settings.use-cases';
import { RecordAuditLogUseCase } from '@application/audit/use-cases/record-audit-log.use-case';
import {
  AUDIT_LOG_REPOSITORY,
  MEDIA_STORAGE_PORT,
  PERMISSION_CACHE,
  PERMISSION_REPOSITORY,
  ROLE_REPOSITORY,
  ORGANIZATION_CONTEXT,
  RUNTIME_CONFIG,
  SITE_SETTING_REPOSITORY,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import { useCaseProvider } from './use-case.provider';

export const REMAINING_USE_CASE_PROVIDERS = [
  useCaseProvider(CreateRoleUseCase, [ROLE_REPOSITORY]),
  useCaseProvider(ListRolesUseCase, [ROLE_REPOSITORY]),
  useCaseProvider(GetRoleUseCase, [ROLE_REPOSITORY]),
  useCaseProvider(UpdateRoleUseCase, [ROLE_REPOSITORY, PERMISSION_CACHE]),
  useCaseProvider(DeleteRoleUseCase, [ROLE_REPOSITORY, PERMISSION_CACHE]),
  useCaseProvider(AssignRoleToUserUseCase, [ROLE_REPOSITORY, PERMISSION_CACHE]),
  useCaseProvider(RemoveRoleFromUserUseCase, [
    ROLE_REPOSITORY,
    PERMISSION_CACHE,
  ]),
  useCaseProvider(CreatePermissionUseCase, [PERMISSION_REPOSITORY]),
  useCaseProvider(ListPermissionsUseCase, [PERMISSION_REPOSITORY]),
  useCaseProvider(GetPermissionUseCase, [PERMISSION_REPOSITORY]),
  useCaseProvider(UpdatePermissionUseCase, [PERMISSION_REPOSITORY]),
  useCaseProvider(DeletePermissionUseCase, [PERMISSION_REPOSITORY]),
  useCaseProvider(GetPublicSiteSettingsUseCase, [SITE_SETTING_REPOSITORY]),
  useCaseProvider(GetSiteSettingsUseCase, [SITE_SETTING_REPOSITORY]),
  useCaseProvider(UpdateSiteSettingsUseCase, [SITE_SETTING_REPOSITORY]),
  useCaseProvider(UploadMediaUseCase, [MEDIA_STORAGE_PORT]),
  useCaseProvider(GetDashboardStatsUseCase, [
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
  ]),
  useCaseProvider(RecordAuditLogUseCase, [AUDIT_LOG_REPOSITORY]),
  useCaseProvider(ListAuditLogsUseCase, [
    AUDIT_LOG_REPOSITORY,
    RecordAuditLogUseCase,
    ORGANIZATION_CONTEXT,
  ]),
  useCaseProvider(PurgeAuditLogsUseCase, [
    AUDIT_LOG_REPOSITORY,
    RUNTIME_CONFIG,
  ]),
];
