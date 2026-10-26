import {
  AddOrganizationMemberInputSchema,
  OrganizationMemberSchema,
  OrganizationSchema,
  PaginatedOrganizationMembersSchema,
  PaginatedOrganizationsSchema,
  type AddOrganizationMemberInput,
  type CreateOrganizationInput,
  type Organization,
  type OrganizationMember,
  type UpdateOrganizationInput,
} from "@default/types/organization";
import { getApi } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { parseWith } from "../parse";
import type { ListQueryParams, PaginatedResult } from "../types";
import { z } from "zod";

const MyOrganizationsSchema = z.array(OrganizationSchema);

export async function listOrganizations(
  params: ListQueryParams,
): Promise<PaginatedResult<Organization>> {
  const data = await getApi().get(API_ENDPOINTS.ORGANIZATIONS.LIST, {
    params,
  });
  return parseWith(
    PaginatedOrganizationsSchema,
    API_ENDPOINTS.ORGANIZATIONS.LIST,
  )(data);
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<Organization> {
  const data = await getApi().post(API_ENDPOINTS.ORGANIZATIONS.LIST, input);
  return parseWith(OrganizationSchema, API_ENDPOINTS.ORGANIZATIONS.LIST)(data);
}

export async function updateOrganization(
  id: number,
  input: UpdateOrganizationInput,
): Promise<Organization> {
  const endpoint = API_ENDPOINTS.ORGANIZATIONS.BY_ID(id);
  const data = await getApi().patch(endpoint, input);
  return parseWith(OrganizationSchema, endpoint)(data);
}

export async function listMyOrganizations(): Promise<Organization[]> {
  const data = await getApi().get(API_ENDPOINTS.AUTH.MY_ORGANIZATIONS);
  return parseWith(MyOrganizationsSchema, API_ENDPOINTS.AUTH.MY_ORGANIZATIONS)(
    data,
  );
}

export async function listOrganizationMembers(
  organizationId: number,
  params: ListQueryParams,
): Promise<PaginatedResult<OrganizationMember>> {
  const endpoint = API_ENDPOINTS.ORGANIZATIONS.MEMBERS(organizationId);
  const data = await getApi().get(endpoint, { params });
  return parseWith(PaginatedOrganizationMembersSchema, endpoint)(data);
}

export async function addOrganizationMember(
  organizationId: number,
  input: AddOrganizationMemberInput,
): Promise<OrganizationMember> {
  AddOrganizationMemberInputSchema.parse(input);
  const endpoint = API_ENDPOINTS.ORGANIZATIONS.MEMBERS(organizationId);
  const data = await getApi().post(endpoint, input);
  return parseWith(OrganizationMemberSchema, endpoint)(data);
}
