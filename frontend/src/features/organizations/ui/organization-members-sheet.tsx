'use client';

import { Loader2, Users } from 'lucide-react';
import { AdminFormSheet } from '@/shared/ui/admin-form-sheet';
import { Button } from '@default/ui/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@default/ui/primitives/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@default/ui/primitives/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@default/ui/primitives/table';
import type { Organization } from '@default/types/organization';
import { useOrganizationMembersSheet } from './use-organization-members-sheet';

type OrganizationMembersSheetProps = {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrganizationMembersSheet({
  organization,
  open,
  onOpenChange,
}: OrganizationMembersSheetProps) {
  const model = useOrganizationMembersSheet({
    organization,
    open,
    onOpenChange,
  });

  if (!open || !organization) return null;

  const addFooter = model.canAdd ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={model.isPending}
      >
        {model.tCommon('close')}
      </Button>
      <Button type="submit" form={model.formId} disabled={model.isPending}>
        {model.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {model.t('addMember')}
      </Button>
    </div>
  ) : (
    <div className="flex justify-end">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
        {model.tCommon('close')}
      </Button>
    </div>
  );

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={model.t('membersTitle', { name: organization.name })}
      description={model.t('membersDescription')}
      size="lg"
      showContentLocale={false}
      footer={addFooter}
    >
      <div className="space-y-6">
        {model.members.isLoading ? (
          <p className="text-sm text-muted-foreground">{model.tCommon('loading')}</p>
        ) : model.members.isError ? (
          <p className="text-sm text-destructive">{model.t('membersLoadFailed')}</p>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{model.t('memberEmail')}</TableHead>
                  <TableHead>{model.t('memberRole')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(model.members.data?.items ?? []).map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.userEmail}</TableCell>
                    <TableCell className="capitalize">{member.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {model.canAdd ? (
          <Form {...model.form}>
            <form
              id={model.formId}
              onSubmit={model.form.handleSubmit(model.onAddSubmit)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <FormField
                control={model.form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{model.t('selectUser')}</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={model.t('selectUser')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {model.users.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={model.form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{model.t('memberRole')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {model.memberRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        ) : null}
      </div>
    </AdminFormSheet>
  );
}

export function OrganizationMembersButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={onClick}
      aria-label={label}
    >
      <Users className="size-4" />
    </Button>
  );
}
