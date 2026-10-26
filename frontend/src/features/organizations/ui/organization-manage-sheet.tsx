'use client';

import { Loader2 } from 'lucide-react';
import { AdminFormSheet } from '@/shared/ui/admin-form-sheet';
import { Button } from '@default/ui/primitives/button';
import {
  OrganizationCreateForm,
  OrganizationEditForm,
} from './organization-manage-forms';
import {
  useOrganizationManageSheet,
  type OrganizationSheetState,
} from './use-organization-manage-sheet';

export type { OrganizationSheetState };

type OrganizationManageSheetProps = {
  state: OrganizationSheetState | null;
  onOpenChange: (open: boolean) => void;
};

export function OrganizationManageSheet({
  state,
  onOpenChange,
}: OrganizationManageSheetProps) {
  const model = useOrganizationManageSheet({ state, onOpenChange });
  if (!model.open) return null;

  const footer = model.canSubmit ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={model.isPending}
      >
        {model.tCommon('cancel')}
      </Button>
      <Button type="submit" form={model.formId} disabled={model.isPending}>
        {model.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {model.isCreate ? model.tCommon('create') : model.tCommon('save')}
      </Button>
    </div>
  ) : null;

  return (
    <AdminFormSheet
      open={model.open}
      onOpenChange={onOpenChange}
      title={
        model.isCreate
          ? model.t('createTitle')
          : model.t('editTitle', { name: model.organization?.name ?? '' })
      }
      description={
        model.isCreate ? model.t('createDescription') : model.t('editDescription')
      }
      size="md"
      showContentLocale={false}
      footer={footer}
    >
      {model.isCreate ? (
        <OrganizationCreateForm
          formId={model.formId}
          form={model.createForm}
          onSubmit={model.onCreateSubmit}
        />
      ) : model.organization ? (
        <OrganizationEditForm
          formId={model.formId}
          form={model.editForm}
          onSubmit={model.onEditSubmit}
        />
      ) : null}
    </AdminFormSheet>
  );
}
