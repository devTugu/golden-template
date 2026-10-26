import { IOrganizationRepository } from '@domain/organization/repositories/organization.repository.interface';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { PaginatedResult, TokenPair } from '@shared/types/pagination';
import { RecordRefreshTokenService } from '@application/auth/services/record-refresh-token.service';
import { ActiveOrganizationService } from '@application/auth/services/active-organization.service';
import type { ClientRequestMeta } from '@application/auth/dto/client-request-meta';

function toIso(date: Date): string {
  return date.toISOString();
}

export class ListOrganizationsUseCase {
  constructor(private readonly organizations: IOrganizationRepository) {}

  async execute(page = 1, limit = 20) {
    const result = await this.organizations.findAll(page, limit);
    return {
      ...result,
      items: result.items.map((org) => ({
        ...org,
        createdAt: toIso(org.createdAt),
        updatedAt: toIso(org.updatedAt),
      })),
    };
  }
}

export class CreateOrganizationUseCase {
  constructor(private readonly organizations: IOrganizationRepository) {}

  async execute(input: { slug: string; name: string }) {
    const existing = await this.organizations.findBySlug(input.slug);
    if (existing) {
      throw AppErrors.CONFLICT('Organization slug already exists.');
    }
    const created = await this.organizations.create(input);
    return {
      ...created,
      createdAt: toIso(created.createdAt),
      updatedAt: toIso(created.updatedAt),
    };
  }
}

export class UpdateOrganizationUseCase {
  constructor(private readonly organizations: IOrganizationRepository) {}

  async execute(id: number, input: { name?: string }) {
    const existing = await this.organizations.findById(id);
    if (!existing) throw AppErrors.NOT_FOUND('Organization not found.');
    const updated = await this.organizations.update(id, input);
    return {
      ...updated,
      createdAt: toIso(updated.createdAt),
      updatedAt: toIso(updated.updatedAt),
    };
  }
}

export class ListOrganizationMembersUseCase {
  constructor(private readonly organizations: IOrganizationRepository) {}

  execute(organizationId: number, page = 1, limit = 20) {
    return this.organizations.listMembers(organizationId, page, limit);
  }
}

export class AddOrganizationMemberUseCase {
  constructor(private readonly organizations: IOrganizationRepository) {}

  async execute(organizationId: number, userId: number, role: string) {
    const org = await this.organizations.findById(organizationId);
    if (!org) throw AppErrors.NOT_FOUND('Organization not found.');
    const member = await this.organizations.addMember(
      organizationId,
      userId,
      role,
    );
    return {
      ...member,
      createdAt: toIso(member.createdAt),
    };
  }
}

export class ListMyOrganizationsUseCase {
  constructor(private readonly organizations: IOrganizationRepository) {}

  async execute(userId: number) {
    const items = await this.organizations.listOrganizationsForUser(userId);
    return items.map((org) => ({
      ...org,
      createdAt: toIso(org.createdAt),
      updatedAt: toIso(org.updatedAt),
    }));
  }
}

export class SwitchOrganizationUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly organizations: IOrganizationRepository,
    private readonly tokens: ITokenIssuer,
    private readonly recordRefresh: RecordRefreshTokenService,
    private readonly activeOrganization: ActiveOrganizationService,
  ) {}

  async execute(
    userId: number,
    organizationId: number,
    meta?: ClientRequestMeta,
  ): Promise<TokenPair> {
    const allowed = await this.organizations.userHasMembership(
      userId,
      organizationId,
    );
    if (!allowed) {
      throw AppErrors.FORBIDDEN('Not a member of this organization.');
    }

    await this.users.update(userId, { organizationId });
    const user = await this.users.findById(userId);
    if (!user) throw AppErrors.UNAUTHORIZED('User not found.');

    await this.activeOrganization.resolveOrganizationId(userId);
    const issued = await this.tokens.issuePair(
      user.id,
      user.email,
      organizationId,
    );
    await this.recordRefresh.record(
      user.id,
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

export type OrganizationListResult = PaginatedResult<{
  id: number;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}>;
