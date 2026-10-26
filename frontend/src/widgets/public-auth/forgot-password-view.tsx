'use client';

import { useTranslations } from 'next-intl';
import { ForgotPasswordForm } from '@/features/auth/ui/forgot-password-form';
import { PublicAuthShell } from './public-auth-shell';

export function ForgotPasswordView() {
  const t = useTranslations('auth');
  return (
    <PublicAuthShell title={t('forgotPasswordTitle')} subtitle={t('forgotPasswordSubtitle')}>
      <ForgotPasswordForm />
    </PublicAuthShell>
  );
}
