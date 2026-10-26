'use client';

import type { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from '@default/types/organization';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@default/ui/primitives/form';
import { Input } from '@default/ui/primitives/input';

type CreateFormProps = {
  formId: string;
  form: UseFormReturn<CreateOrganizationInput>;
  onSubmit: (values: CreateOrganizationInput) => void;
};

export function OrganizationCreateForm({
  formId,
  form,
  onSubmit,
}: CreateFormProps) {
  const t = useTranslations('entities.organizations');
  const tTable = useTranslations('table');

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tTable('name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tTable('slug')}</FormLabel>
              <FormControl>
                <Input placeholder={t('slugPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

type EditFormProps = {
  formId: string;
  form: UseFormReturn<UpdateOrganizationInput>;
  onSubmit: (values: UpdateOrganizationInput) => void;
};

export function OrganizationEditForm({
  formId,
  form,
  onSubmit,
}: EditFormProps) {
  const tTable = useTranslations('table');

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tTable('name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
