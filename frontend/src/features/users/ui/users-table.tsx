"use client";

import { useState } from "react";
import { InviteUserDialog } from "./invite-user-dialog";
import { useTranslations } from "next-intl";
import type { UserOutput } from "@/entities/user";
import { useAuthPermissions } from "@/features/auth";
import { PERMISSION_CODES } from "@/shared/config/permissions";
import { useTableSearchParams } from "@/shared/hooks/use-table-search-params";
import {
  DataTableEmpty,
  DataTableQueryState,
  InvoiceManagementDataTable,
} from "@/shared/ui/data-table";
import { Button } from "@default/ui/primitives/button";
import { useUsers } from "@/entities/user";
import { UserDeleteDialog } from "@/features/users/ui/user-delete-dialog";
import { UserManageSheet, type UserSheetState } from "./user-manage-sheet";
import { useUsersTableColumns } from "./use-users-table-columns";

export function UsersTable() {
  const t = useTranslations("entities.users");
  const { can } = useAuthPermissions();
  const { pagination, setPagination, onSearchChange, queryParams, search } =
    useTableSearchParams({ defaultPageSize: 10 });
  const { data, isLoading, isError, error, refetch } = useUsers(queryParams);
  const [sheetState, setSheetState] = useState<UserSheetState | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserOutput | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const columns = useUsersTableColumns({ setSheetState, setDeleteUser });
  const canCreate = can(PERMISSION_CODES.USER_CREATE);
  const canInvite = can(PERMISSION_CODES.USERS_INVITE);

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
        searchPlaceholder={t("searchPlaceholder")}
        toolbarActions={
          canCreate || canInvite ? (
            <div className="flex gap-2">
              {canInvite ? (
                <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
                  {t("inviteUser")}
                </Button>
              ) : null}
              {canCreate ? (
                <Button size="sm" onClick={() => setSheetState({ mode: "create" })}>
                  {t("addUser")}
                </Button>
              ) : null}
            </div>
          ) : null
        }
        emptyContent={
          <DataTableEmpty
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            action={
              canCreate ? (
                <Button
                  size="sm"
                  onClick={() => setSheetState({ mode: "create" })}
                >
                  {t("addUser")}
                </Button>
              ) : undefined
            }
          />
        }
      />
      <UserManageSheet
        state={sheetState}
        onOpenChange={(open) => !open && setSheetState(null)}
      />
      <UserDeleteDialog
        user={deleteUser}
        open={Boolean(deleteUser)}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      />
      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </DataTableQueryState>
  );
}
