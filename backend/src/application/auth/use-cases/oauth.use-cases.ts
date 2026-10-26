import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IOAuthIdentityProvider } from '@application/ports/identity.port';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { LoginResult } from '../dto/login-result';
import { roleRequiresMfa } from '../lib/mfa-required-roles';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';
import { MfaPolicyService } from '../services/mfa-policy.service';
import type { ClientRequestMeta } from '../dto/client-request-meta';
import { RecordRefreshTokenService } from '../services/record-refresh-token.service';
import { ActiveOrganizationService } from '../services/active-organization.service';

export class GetOAuthAuthorizationUrlUseCase {
  constructor(private readonly oauth: IOAuthIdentityProvider) {}

  async execute(state: string): Promise<{ url: string }> {
    if (!this.oauth.isEnabled()) {
      throw AppErrors.BAD_REQUEST('OAuth is not enabled.');
    }
    const url = await this.oauth.getAuthorizationUrl(state);
    return { url };
  }
}

export class CompleteOAuthLoginUseCase {
  constructor(
    private readonly oauth: IOAuthIdentityProvider,
    private readonly users: IUserRepository,
    private readonly tokens: ITokenIssuer,
    private readonly recordRefresh: RecordRefreshTokenService,
    private readonly permissionCache: IPermissionCache,
    private readonly hasher: IPasswordHasher,
    private readonly runtimeConfig: IRuntimeConfig,
    private readonly mfaPolicy: MfaPolicyService,
    private readonly activeOrganization: ActiveOrganizationService,
  ) {}

  async execute(
    callbackUrl: string,
    meta?: ClientRequestMeta,
  ): Promise<LoginResult> {
    if (!this.oauth.isEnabled()) {
      throw AppErrors.BAD_REQUEST('OAuth is not enabled.');
    }

    const profile = await this.oauth.exchangeCode(callbackUrl);
    let user =
      (await this.users.findByOAuth(profile.provider, profile.subject)) ??
      (await this.users.findByEmail(profile.email));

    if (!user) {
      user = await this.users.create({
        email: profile.email,
        passwordHash: await this.hasher.hash(crypto.randomUUID()),
        isActive: true,
        oauthProvider: profile.provider,
        oauthSubject: profile.subject,
      });
    } else if (!user.oauthProvider) {
      user = await this.users.update(user.id, {
        oauthProvider: profile.provider,
        oauthSubject: profile.subject,
      });
    }

    const authUser = await this.users.findByEmailWithRolesAndPermissions(
      user.email,
    );
    if (!authUser) throw AppErrors.UNAUTHORIZED('OAuth user inactive.');

    const requiredRoles = await this.mfaPolicy.getRequiredRoles();
    const privilegedRole = roleRequiresMfa(authUser.roleNames, requiredRoles);

    if (authUser.mfaEnabled) {
      const mfaToken = await this.tokens.issueMfaPendingToken(authUser.id);
      return { requiresMfa: true, mfaToken };
    }

    if (privilegedRole) {
      const enrollmentToken = await this.tokens.issueMfaEnrollmentPendingToken(
        authUser.id,
      );
      return { requiresMfaEnrollment: true, enrollmentToken };
    }

    const ttl = this.runtimeConfig.getPermissionCacheTtlSec();
    await this.permissionCache.set(
      authUser.id,
      {
        roleNames: authUser.roleNames,
        permissionCodes: authUser.permissionCodes,
      },
      ttl,
    );

    const organizationId = await this.activeOrganization.resolveOrganizationId(
      authUser.id,
    );
    const issued = await this.tokens.issuePair(
      authUser.id,
      authUser.email,
      organizationId,
    );
    await this.recordRefresh.record(
      authUser.id,
      issued.refreshToken,
      issued.refreshExpiresAt,
      meta,
    );
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      expiresIn: issued.accessExpiresIn,
    };
  }
}
