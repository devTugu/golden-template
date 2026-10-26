import {
  AddOrganizationMemberUseCase,
  CreateOrganizationUseCase,
  ListMyOrganizationsUseCase,
  ListOrganizationMembersUseCase,
  ListOrganizationsUseCase,
  SwitchOrganizationUseCase,
  UpdateOrganizationUseCase,
} from '@application/organization/use-cases/organization.use-cases';
import { ActiveOrganizationService } from '@application/auth/services/active-organization.service';
import { RecordRefreshTokenService } from '@application/auth/services/record-refresh-token.service';
import {
  ORGANIZATION_REPOSITORY,
  TOKEN_ISSUER,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import { useCaseProvider } from './use-case.provider';

export const ORGANIZATION_USE_CASE_PROVIDERS = [
  useCaseProvider(ListOrganizationsUseCase, [ORGANIZATION_REPOSITORY]),
  useCaseProvider(CreateOrganizationUseCase, [ORGANIZATION_REPOSITORY]),
  useCaseProvider(UpdateOrganizationUseCase, [ORGANIZATION_REPOSITORY]),
  useCaseProvider(ListOrganizationMembersUseCase, [ORGANIZATION_REPOSITORY]),
  useCaseProvider(AddOrganizationMemberUseCase, [ORGANIZATION_REPOSITORY]),
  useCaseProvider(ListMyOrganizationsUseCase, [ORGANIZATION_REPOSITORY]),
  useCaseProvider(SwitchOrganizationUseCase, [
    USER_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    TOKEN_ISSUER,
    RecordRefreshTokenService,
    ActiveOrganizationService,
  ]),
];
