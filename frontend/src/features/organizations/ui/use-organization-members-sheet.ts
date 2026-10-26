'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AddOrganizationMemberInputSchema,
  type AddOrganizationMemberInput,
  type Organization,
} from '@default/types/organization';
import {
  useAddOrganizationMember,
  useOrganizationMembers,
} from '@default/hooks';
import { useUsers } from '@/entities/user';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';

const MEMBER_ROLES = ['owner', 'admin', 'member'] as const;

export function useOrganizationMembersSheet(params: {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { organization, open, onOpenChange } = params;
  const formId = useId();
  const t = useTranslations('entities.organizations');
  const tCommon = useTranslations('common');
  const { can } = useAuthPermissions();
  const orgId = organization?.id ?? 0;

  const members = useOrganizationMembers(
    orgId,
    { page: 1, limit: 50 },
    open && orgId > 0,
  );
  const { data: usersData } = useUsers({ page: 1, limit: 100 });
  const addMember = useAddOrganizationMember(orgId);

  const form = useForm<AddOrganizationMemberInput>({
    resolver: zodResolver(AddOrganizationMemberInputSchema),
    defaultValues: { role: 'member' },
  });

  const canAdd = can(PERMISSION_CODES.ORGANIZATION_WRITE);

  const onAddSubmit = async (values: AddOrganizationMemberInput) => {
    if (!organization) return;
    try {
      await addMember.mutateAsync(values);
      toast.success(t('memberAdded'));
      form.reset({ role: 'member' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    open,
    organization,
    onOpenChange,
    formId,
    t,
    tCommon,
    members,
    users: usersData?.items ?? [],
    form,
    canAdd,
    onAddSubmit,
    isPending: addMember.isPending,
    memberRoles: MEMBER_ROLES,
  };
}
