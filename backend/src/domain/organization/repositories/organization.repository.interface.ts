import { PaginatedResult } from '@shared/types/pagination';

export interface OrganizationRecord {
  id: number;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMemberRecord {
  id: number;
  organizationId: number;
  userId: number;
  userEmail: string;
  role: string;
  createdAt: Date;
}

export interface IOrganizationRepository {
  findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<OrganizationRecord>>;
  findById(id: number): Promise<OrganizationRecord | null>;
  findBySlug(slug: string): Promise<OrganizationRecord | null>;
  create(input: { slug: string; name: string }): Promise<OrganizationRecord>;
  update(id: number, input: { name?: string }): Promise<OrganizationRecord>;
  listMembers(
    organizationId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<OrganizationMemberRecord>>;
  addMember(
    organizationId: number,
    userId: number,
    role: string,
  ): Promise<OrganizationMemberRecord>;
  userHasMembership(userId: number, organizationId: number): Promise<boolean>;
  listOrganizationsForUser(userId: number): Promise<OrganizationRecord[]>;
}
