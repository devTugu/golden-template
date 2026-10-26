'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AcceptInviteSchema,
  type AcceptInviteInput,
} from '@default/types/auth';
import { Button } from '@default/ui/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@default/ui/primitives/form';
import { Input } from '@default/ui/primitives/input';
import { ROUTES } from '@/shared/config/routes';
import { getErrorMessage } from '@/shared/api';

type SetPasswordWithTokenFormProps = {
  token: string;
  submitLabel: string;
  pendingLabel: string;
  successToast: string;
  onSubmitMutation: (data: AcceptInviteInput) => Promise<void>;
  isPending: boolean;
};

export function SetPasswordWithTokenForm({
  token,
  submitLabel,
  pendingLabel,
  successToast,
  onSubmitMutation,
  isPending,
}: SetPasswordWithTokenFormProps) {
  const router = useRouter();
  const t = useTranslations('auth');
  const form = useForm<AcceptInviteInput>({
    resolver: zodResolver(AcceptInviteSchema),
    defaultValues: { token, password: '' },
  });

  const onSubmit = async (values: AcceptInviteInput) => {
    try {
      await onSubmitMutation({ ...values, token });
      toast.success(successToast);
      router.push(ROUTES.LOGIN);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-destructive">{t('missingToken')}</p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('newPassword')}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
