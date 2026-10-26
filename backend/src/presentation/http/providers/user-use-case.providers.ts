import {
  AnonymizeUserUseCase,
  ExportUserDataUseCase,
} from '@application/user/use-cases/gdpr.use-cases';
import { CreateUserUseCase } from '@application/user/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '@application/user/use-cases/delete-user.use-case';
import { GetUserUseCase } from '@application/user/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@application/user/use-cases/list-users.use-case';
import { LoadUserAuthContextUseCase } from '@application/user/use-cases/load-user-auth-context.use-case';
import { UpdateUserUseCase } from '@application/user/use-cases/update-user.use-case';
import {
  AUDIT_LOG_REPOSITORY,
  PASSWORD_HASHER,
  PERMISSION_CACHE,
  REFRESH_TOKEN_REPOSITORY,
  RUNTIME_CONFIG,
  ORGANIZATION_CONTEXT,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import { useCaseProvider } from './use-case.provider';

export const USER_USE_CASE_PROVIDERS = [
  useCaseProvider(CreateUserUseCase, [USER_REPOSITORY, PASSWORD_HASHER]),
  useCaseProvider(ListUsersUseCase, [USER_REPOSITORY]),
  useCaseProvider(GetUserUseCase, [USER_REPOSITORY, ORGANIZATION_CONTEXT]),
  useCaseProvider(UpdateUserUseCase, [
    USER_REPOSITORY,
    PASSWORD_HASHER,
    PERMISSION_CACHE,
  ]),
  useCaseProvider(DeleteUserUseCase, [USER_REPOSITORY, PERMISSION_CACHE]),
  useCaseProvider(LoadUserAuthContextUseCase, [
    USER_REPOSITORY,
    PERMISSION_CACHE,
    RUNTIME_CONFIG,
  ]),
  useCaseProvider(ExportUserDataUseCase, [
    USER_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
  ]),
  useCaseProvider(AnonymizeUserUseCase, [
    USER_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
  ]),
];
