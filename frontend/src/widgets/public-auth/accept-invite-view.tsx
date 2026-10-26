'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAcceptInvite } from '@/features/auth';
import { SetPasswordWithTokenForm } from '@/features/auth/ui/set-password-with-token-form';
import { PublicAuthShell } from './public-auth-shell';

export function AcceptInviteView() {
  const t = useTranslations('auth');
  const token = useSearchParams().get('token') ?? '';
  const accept = useAcceptInvite();

  return (
    <PublicAuthShell title={t('acceptInviteTitle')} subtitle={t('acceptInviteSubtitle')}>
      <SetPasswordWithTokenForm
        token={token}
        submitLabel={t('acceptInviteSubmit')}
        pendingLabel={t('acceptInviteSubmitting')}
        successToast={t('inviteAccepted')}
        isPending={accept.isPending}
        onSubmitMutation={(data) => accept.mutateAsync(data)}
      />
    </PublicAuthShell>
  );
}
