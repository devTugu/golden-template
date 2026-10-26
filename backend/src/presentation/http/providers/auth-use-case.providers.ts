import { ActiveOrganizationService } from '@application/auth/services/active-organization.service';
import { MfaPolicyService } from '@application/auth/services/mfa-policy.service';
import { RecordRefreshTokenService } from '@application/auth/services/record-refresh-token.service';
import { LoginUseCase } from '@application/auth/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@application/auth/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@application/auth/use-cases/logout.use-case';
import { VerifyMfaLoginUseCase } from '@application/auth/use-cases/verify-mfa-login.use-case';
import {
  ConfirmMfaEnrollUseCase,
  ConfirmMfaEnrollWithEnrollmentTokenUseCase,
} from '@application/auth/use-cases/confirm-mfa-enroll.use-case';
import {
  EnrollMfaUseCase,
  EnrollMfaWithEnrollmentTokenUseCase,
} from '@application/auth/use-cases/enroll-mfa.use-case';
import { DisableMfaUseCase } from '@application/auth/use-cases/disable-mfa.use-case';
import {
  CompleteOAuthLoginUseCase,
  GetOAuthAuthorizationUrlUseCase,
} from '@application/auth/use-cases/oauth.use-cases';
import {
  ListAuthSessionsUseCase,
  RevokeAuthSessionUseCase,
  RevokeOtherAuthSessionsUseCase,
} from '@application/auth/use-cases/sessions.use-cases';
import {
  MFA_VERIFIER,
  OAUTH_IDENTITY,
  PASSWORD_HASHER,
  PERMISSION_CACHE,
  ORGANIZATION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  RUNTIME_CONFIG,
  SITE_SETTING_REPOSITORY,
  TOKEN_BLACKLIST,
  TOKEN_ISSUER,
  USER_REPOSITORY,
} from '@shared/constants/tokens';
import { useCaseProvider } from './use-case.provider';

export const AUTH_USE_CASE_PROVIDERS = [
  useCaseProvider(ActiveOrganizationService, [
    USER_REPOSITORY,
    ORGANIZATION_REPOSITORY,
  ]),
  useCaseProvider(RecordRefreshTokenService, [REFRESH_TOKEN_REPOSITORY]),
  useCaseProvider(MfaPolicyService, [SITE_SETTING_REPOSITORY, RUNTIME_CONFIG]),
  useCaseProvider(LoginUseCase, [
    USER_REPOSITORY,
    PASSWORD_HASHER,
    RecordRefreshTokenService,
    TOKEN_ISSUER,
    PERMISSION_CACHE,
    RUNTIME_CONFIG,
    MfaPolicyService,
    ActiveOrganizationService,
  ]),
  useCaseProvider(VerifyMfaLoginUseCase, [
    USER_REPOSITORY,
    TOKEN_ISSUER,
    RecordRefreshTokenService,
    PERMISSION_CACHE,
    MFA_VERIFIER,
    RUNTIME_CONFIG,
    ActiveOrganizationService,
  ]),
  useCaseProvider(RefreshTokenUseCase, [
    USER_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    TOKEN_ISSUER,
    PERMISSION_CACHE,
    RUNTIME_CONFIG,
    RecordRefreshTokenService,
    ActiveOrganizationService,
  ]),
  useCaseProvider(LogoutUseCase, [
    REFRESH_TOKEN_REPOSITORY,
    TOKEN_ISSUER,
    TOKEN_BLACKLIST,
  ]),
  useCaseProvider(EnrollMfaUseCase, [USER_REPOSITORY, MFA_VERIFIER]),
  useCaseProvider(ConfirmMfaEnrollUseCase, [USER_REPOSITORY, MFA_VERIFIER]),
  useCaseProvider(DisableMfaUseCase, [USER_REPOSITORY, MFA_VERIFIER]),
  useCaseProvider(EnrollMfaWithEnrollmentTokenUseCase, [
    USER_REPOSITORY,
    MFA_VERIFIER,
    TOKEN_ISSUER,
  ]),
  useCaseProvider(ConfirmMfaEnrollWithEnrollmentTokenUseCase, [
    USER_REPOSITORY,
    MFA_VERIFIER,
    TOKEN_ISSUER,
    PERMISSION_CACHE,
    RUNTIME_CONFIG,
    RecordRefreshTokenService,
    ActiveOrganizationService,
  ]),
  useCaseProvider(GetOAuthAuthorizationUrlUseCase, [OAUTH_IDENTITY]),
  useCaseProvider(CompleteOAuthLoginUseCase, [
    OAUTH_IDENTITY,
    USER_REPOSITORY,
    TOKEN_ISSUER,
    RecordRefreshTokenService,
    PERMISSION_CACHE,
    PASSWORD_HASHER,
    RUNTIME_CONFIG,
    MfaPolicyService,
    ActiveOrganizationService,
  ]),
  useCaseProvider(ListAuthSessionsUseCase, [
    REFRESH_TOKEN_REPOSITORY,
    RecordRefreshTokenService,
  ]),
  useCaseProvider(RevokeAuthSessionUseCase, [REFRESH_TOKEN_REPOSITORY]),
  useCaseProvider(RevokeOtherAuthSessionsUseCase, [
    REFRESH_TOKEN_REPOSITORY,
    RecordRefreshTokenService,
  ]),
];
