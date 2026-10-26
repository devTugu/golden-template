'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@default/ui/primitives/select';
import { useMyOrganizations, useSwitchOrganization } from '@default/hooks';
import { getErrorMessage } from '@/shared/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function OrganizationSwitcher() {
  const t = useTranslations('dashboard.header');
  const router = useRouter();
  const { data: organizations, isLoading } = useMyOrganizations();
  const switchOrg = useSwitchOrganization();
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(
    undefined,
  );

  if (isLoading || !organizations || organizations.length <= 1) {
    return null;
  }

  const activeOrgId = selectedOrgId ?? organizations[0]?.id;
  const value = String(activeOrgId ?? '');

  const handleChange = async (next: string | null) => {
    if (!next) {
      return;
    }
    const organizationId = Number(next);
    if (!Number.isFinite(organizationId) || organizationId === activeOrgId) {
      return;
    }
    try {
      await switchOrg.mutateAsync(organizationId);
      setSelectedOrgId(organizationId);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={switchOrg.isPending}
    >
      <SelectTrigger
        className="h-9 w-[180px] gap-2 border-none bg-transparent shadow-none"
        aria-label={t('organization')}
      >
        <Building2 className="size-4 shrink-0 opacity-70" />
        <SelectValue placeholder={t('organization')} />
      </SelectTrigger>
      <SelectContent align="end">
        {organizations.map((org) => (
          <SelectItem key={org.id} value={String(org.id)}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
