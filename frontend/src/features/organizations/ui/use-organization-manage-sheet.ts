'use client';

import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  CreateOrganizationInputSchema,
  UpdateOrganizationInputSchema,
  type CreateOrganizationInput,
  type Organization,
  type UpdateOrganizationInput,
} from '@default/types/organization';
import {
  useCreateOrganization,
  useUpdateOrganization,
} from '@default/hooks';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';

export type OrganizationSheetState =
  | { mode: 'create' }
  | { mode: 'edit'; organization: Organization };

export function useOrganizationManageSheet(params: {
  state: OrganizationSheetState | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, onOpenChange } = params;
  const formId = useId();
  const t = useTranslations('entities.organizations');
  const tCommon = useTranslations('common');
  const { can } = useAuthPermissions();
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();

  const isCreate = state?.mode === 'create';
  const organization = state?.mode === 'edit' ? state.organization : null;
  const open = state !== null;
  const canSubmit = can(PERMISSION_CODES.ORGANIZATION_WRITE);

  const createForm = useForm<CreateOrganizationInput>({
    resolver: zodResolver(CreateOrganizationInputSchema),
    defaultValues: { name: '', slug: '' },
  });

  const editForm = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(UpdateOrganizationInputSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      createForm.reset({ name: '', slug: '' });
      return;
    }
    if (organization) {
      editForm.reset({ name: organization.name });
    }
  }, [open, isCreate, organization, createForm, editForm]);

  const onCreateSubmit = async (values: CreateOrganizationInput) => {
    try {
      await createOrg.mutateAsync(values);
      toast.success(t('toastCreated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateOrganizationInput) => {
    if (!organization) return;
    try {
      await updateOrg.mutateAsync({ id: organization.id, input: values });
      toast.success(t('toastUpdated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isPending = createOrg.isPending || updateOrg.isPending;

  return {
    open,
    formId,
    t,
    tCommon,
    isCreate,
    organization,
    createForm,
    editForm,
    canSubmit,
    onCreateSubmit,
    onEditSubmit,
    isPending,
  };
}
