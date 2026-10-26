import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import {
  IOrganizationRepository,
  OrganizationMemberRecord,
  OrganizationRecord,
} from '@domain/organization/repositories/organization.repository.interface';
import {
  DRIZZLE,
  type DrizzleDatabase,
} from '../database/drizzle/drizzle.tokens';
import {
  organizationMembers,
  organizations,
  users,
} from '../database/drizzle/schema';
import { PaginatedResult } from '@shared/types/pagination';

function mapOrg(row: typeof organizations.$inferSelect): OrganizationRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class OrganizationDrizzleRepository implements IOrganizationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<OrganizationRecord>> {
    const [items, totalRow] = await Promise.all([
      this.db.query.organizations.findMany({
        orderBy: desc(organizations.createdAt),
        limit,
        offset: (page - 1) * limit,
      }),
      this.db.select({ value: count() }).from(organizations),
    ]);
    const total = totalRow[0]?.value ?? 0;
    return {
      items: items.map(mapOrg),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findById(id: number): Promise<OrganizationRecord | null> {
    return this.db.query.organizations
      .findFirst({ where: eq(organizations.id, id) })
      .then((row) => (row ? mapOrg(row) : null));
  }

  findBySlug(slug: string): Promise<OrganizationRecord | null> {
    return this.db.query.organizations
      .findFirst({ where: eq(organizations.slug, slug) })
      .then((row) => (row ? mapOrg(row) : null));
  }

  async create(input: {
    slug: string;
    name: string;
  }): Promise<OrganizationRecord> {
    const [inserted] = await this.db
      .insert(organizations)
      .values({ slug: input.slug, name: input.name })
      .returning();
    return mapOrg(inserted);
  }

  async update(
    id: number,
    input: { name?: string },
  ): Promise<OrganizationRecord> {
    const [updated] = await this.db
      .update(organizations)
      .set({ name: input.name })
      .where(eq(organizations.id, id))
      .returning();
    if (!updated) throw new Error('ORGANIZATION_NOT_FOUND');
    return mapOrg(updated);
  }

  async listMembers(
    organizationId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<OrganizationMemberRecord>> {
    const where = eq(organizationMembers.organizationId, organizationId);
    const [rows, totalRow] = await Promise.all([
      this.db
        .select({
          id: organizationMembers.id,
          organizationId: organizationMembers.organizationId,
          userId: organizationMembers.userId,
          role: organizationMembers.role,
          createdAt: organizationMembers.createdAt,
          userEmail: users.email,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(users.id, organizationMembers.userId))
        .where(where)
        .orderBy(desc(organizationMembers.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ value: count() }).from(organizationMembers).where(where),
    ]);
    const total = totalRow[0]?.value ?? 0;
    return {
      items: rows.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        userId: row.userId,
        userEmail: row.userEmail,
        role: row.role,
        createdAt: row.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addMember(
    organizationId: number,
    userId: number,
    role: string,
  ): Promise<OrganizationMemberRecord> {
    const [inserted] = await this.db
      .insert(organizationMembers)
      .values({ organizationId, userId, role })
      .returning();
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    return {
      id: inserted.id,
      organizationId: inserted.organizationId,
      userId: inserted.userId,
      userEmail: user.email,
      role: inserted.role,
      createdAt: inserted.createdAt,
    };
  }

  async userHasMembership(
    userId: number,
    organizationId: number,
  ): Promise<boolean> {
    const row = await this.db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    });
    return !!row;
  }

  async listOrganizationsForUser(
    userId: number,
  ): Promise<OrganizationRecord[]> {
    const rows = await this.db
      .select({ org: organizations })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizations.id, organizationMembers.organizationId),
      )
      .where(eq(organizationMembers.userId, userId));
    return rows.map((row) => mapOrg(row.org));
  }
}
