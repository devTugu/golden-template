"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrganizationMember,
  createOrganization,
  listMyOrganizations,
  listOrganizationMembers,
  listOrganizations,
  organizationKeys,
  updateOrganization,
} from "@default/api";
import type {
  AddOrganizationMemberInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@default/types/organization";
import type { ListQueryParams } from "@default/api";
import { listQueryOptions } from "../list-query-options";
import { userKeys } from "@default/api";
import { getSwitchOrganizationFetcher } from "./switch-organization-fetcher";

export { organizationKeys };

export const useOrganizations = (params: ListQueryParams) => {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => listOrganizations(params),
    ...listQueryOptions,
  });
};

export const useMyOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.mine(),
    queryFn: () => listMyOrganizations(),
    ...listQueryOptions,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

export const useSwitchOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: number) =>
      getSwitchOrganizationFetcher()(organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.all });
      await queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateOrganizationInput;
    }) => updateOrganization(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

export const useOrganizationMembers = (
  organizationId: number,
  params: ListQueryParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: organizationKeys.members(organizationId, params),
    queryFn: () => listOrganizationMembers(organizationId, params),
    enabled: enabled && organizationId > 0,
    ...listQueryOptions,
  });
};

export const useAddOrganizationMember = (organizationId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddOrganizationMemberInput) =>
      addOrganizationMember(organizationId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.memberLists(organizationId),
      });
      await queryClient.invalidateQueries({ queryKey: organizationKeys.mine() });
    },
  });
};
