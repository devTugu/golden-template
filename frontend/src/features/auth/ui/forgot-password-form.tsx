'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import { PasswordForgotSchema, type PasswordForgotInput } from '@default/types/auth';
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
import { useForgotPassword } from '../api/password-recovery.mutations';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const forgot = useForgotPassword();
  const form = useForm<PasswordForgotInput>({
    resolver: zodResolver(PasswordForgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: PasswordForgotInput) => {
    try {
      await forgot.mutateAsync(values);
      toast.success(t('resetEmailSent'));
      form.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={forgot.isPending}>
          {forgot.isPending ? t('sendingResetLink') : t('sendResetLink')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href={ROUTES.LOGIN} className="underline-offset-4 hover:underline">
            {t('backToSignIn')}
          </Link>
        </p>
      </form>
    </Form>
  );
}
