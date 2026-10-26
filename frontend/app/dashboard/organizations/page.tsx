import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { OrganizationsTable } from '@/features/organizations';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';

export default async function OrganizationsPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.organizations');

  return (
    <RequirePermission permission={PERMISSION_CODES.ORGANIZATION_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('organizations')}
          description={t('pageDescription')}
        />
        <OrganizationsTable />
      </div>
    </RequirePermission>
  );
}
