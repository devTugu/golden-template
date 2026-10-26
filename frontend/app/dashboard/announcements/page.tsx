import { RequirePermission } from '@/features/auth';
import { AnnouncementsTable } from '@/features/announcements';
import { PERMISSION_CODES } from '@/shared/config/permissions';

export default function AnnouncementsPage() {
  return (
    <RequirePermission permission={PERMISSION_CODES.ANNOUNCEMENT_READ}>
      <AnnouncementsTable />
    </RequirePermission>
  );
}
