'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from '@default/hooks';
import type { Announcement } from '@default/types/announcements';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { DataTableQueryState } from '@/shared/ui/data-table';
import { Button } from '@default/ui/primitives/button';
import { Input } from '@default/ui/primitives/input';
import { Textarea } from '@default/ui/primitives/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@default/ui/primitives/dialog';
import { Switch } from '@default/ui/primitives/switch';
import { Label } from '@default/ui/primitives/label';

type FormState = {
  title: string;
  body: string;
  published: boolean;
};

const emptyForm: FormState = { title: '', body: '', published: false };

export function AnnouncementsTable() {
  const t = useTranslations('entities.announcements');
  const { can } = useAuthPermissions();
  const { queryParams } = useTableSearchParams({ defaultPageSize: 20 });
  const { data, isLoading, isError, error, refetch } =
    useAnnouncements(queryParams);
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row: Announcement) => {
    setEditing(row);
    setForm({
      title: row.title,
      body: row.body,
      published: row.published,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: form,
      });
    } else {
      await createMutation.mutateAsync(form);
    }
    setOpen(false);
  };

  return (
    <DataTableQueryState isError={isError} error={error} refetch={refetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('pageTitle')}
          </h1>
          {can(PERMISSION_CODES.ANNOUNCEMENT_CREATE) ? (
            <Button type="button" onClick={openCreate}>
              {t('create')}
            </Button>
          ) : null}
        </div>
        {isLoading ? null : (
          <ul className="divide-y rounded-md border">
            {(data?.items ?? []).map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {item.body}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.published ? t('published') : t('draft')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {can(PERMISSION_CODES.ANNOUNCEMENT_UPDATE) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                    >
                      {t('edit')}
                    </Button>
                  ) : null}
                  {can(PERMISSION_CODES.ANNOUNCEMENT_DELETE) ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      {t('delete')}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t('editTitle') : t('createTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder={t('titlePlaceholder')}
            />
            <Textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder={t('bodyPlaceholder')}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(published) =>
                  setForm((f) => ({ ...f, published }))
                }
              />
              <Label htmlFor="published">{t('published')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => void onSubmit()}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DataTableQueryState>
  );
}
