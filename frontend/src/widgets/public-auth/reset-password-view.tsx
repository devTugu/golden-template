'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useResetPassword } from '@/features/auth';
import { SetPasswordWithTokenForm } from '@/features/auth/ui/set-password-with-token-form';
import { PublicAuthShell } from './public-auth-shell';

export function ResetPasswordView() {
  const t = useTranslations('auth');
  const token = useSearchParams().get('token') ?? '';
  const reset = useResetPassword();

  return (
    <PublicAuthShell title={t('resetPasswordTitle')} subtitle={t('resetPasswordSubtitle')}>
      <SetPasswordWithTokenForm
        token={token}
        submitLabel={t('resetPasswordSubmit')}
        pendingLabel={t('resetPasswordSubmitting')}
        successToast={t('passwordUpdated')}
        isPending={reset.isPending}
        onSubmitMutation={(data) => reset.mutateAsync(data)}
      />
    </PublicAuthShell>
  );
}
