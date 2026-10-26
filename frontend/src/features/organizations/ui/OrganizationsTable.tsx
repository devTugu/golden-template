'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy';
import { useTranslations } from 'next-intl';
import type { Organization } from '@default/types/organization';
import { useOrganizations } from '@default/hooks';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { AdminTableActions } from '@/shared/ui/admin-table-actions';
import {
  DataTableEmpty,
  DataTableQueryState,
  InvoiceManagementDataTable,
} from '@/shared/ui/data-table';
import { Button } from '@default/ui/primitives/button';
import {
  OrganizationManageSheet,
  type OrganizationSheetState,
} from './organization-manage-sheet';
import {
  OrganizationMembersButton,
  OrganizationMembersSheet,
} from './organization-members-sheet';

export function OrganizationsTable() {
  const t = useTranslations('entities.organizations');
  const tTable = useTranslations('table');
  const { can } = useAuthPermissions();
  const { pagination, setPagination, onSearchChange, queryParams, search } =
    useTableSearchParams({ defaultPageSize: 10 });
  const { data, isLoading, isError, error, refetch } =
    useOrganizations(queryParams);
  const [sheetState, setSheetState] = useState<OrganizationSheetState | null>(
    null,
  );
  const [membersOrg, setMembersOrg] = useState<Organization | null>(null);

  const canWrite = can(PERMISSION_CODES.ORGANIZATION_WRITE);

  const columns = useMemo<ColumnDef<Organization, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => tTable('name'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'id',
        header: () => 'ID',
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.id}</span>
        ),
      },
      {
        id: 'actions',
        header: () => tTable('actions'),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {canWrite ? (
              <OrganizationMembersButton
                label={t('membersAction')}
                onClick={() => setMembersOrg(row.original)}
              />
            ) : null}
            <AdminTableActions
              name={row.original.name}
              updatePermission={PERMISSION_CODES.ORGANIZATION_WRITE}
              can={can}
              variant="icons"
              onEdit={() =>
                setSheetState({ mode: 'edit', organization: row.original })
              }
            />
          </div>
        ),
      },
    ],
    [t, tTable, can, canWrite],
  );

  return (
    <DataTableQueryState isError={isError} error={error} refetch={refetch}>
      <InvoiceManagementDataTable
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.total ?? 0}
        pageCount={data?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={t('searchPlaceholder')}
        toolbarActions={
          canWrite ? (
            <Button size="sm" onClick={() => setSheetState({ mode: 'create' })}>
              {t('addOrganization')}
            </Button>
          ) : null
        }
        emptyContent={
          <DataTableEmpty
            title={t('emptyTitle')}
            action={
              canWrite ? (
                <Button
                  size="sm"
                  onClick={() => setSheetState({ mode: 'create' })}
                >
                  {t('addOrganization')}
                </Button>
              ) : undefined
            }
          />
        }
      />
      <OrganizationManageSheet
        state={sheetState}
        onOpenChange={(open) => !open && setSheetState(null)}
      />
      <OrganizationMembersSheet
        organization={membersOrg}
        open={membersOrg !== null}
        onOpenChange={(open) => !open && setMembersOrg(null)}
      />
    </DataTableQueryState>
  );
}
