import { Suspense } from 'react';
import { ResetPasswordView } from '@/widgets/public-auth/reset-password-view';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  );
}
