import { Suspense } from 'react';
import { AcceptInviteView } from '@/widgets/public-auth/accept-invite-view';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteView />
    </Suspense>
  );
}
