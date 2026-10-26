import { Injectable } from '@nestjs/common';
import { AppErrors } from '@application/exceptions/application.exception';
import type {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
  UpdateAnnouncementInput,
} from '@default/types/announcements';
import {
  AnnouncementsRepository,
  type AnnouncementRow,
} from './announcements.repository';

function toOutput(row: AnnouncementRow) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class AnnouncementsService {
  constructor(private readonly repo: AnnouncementsRepository) {}

  list(query: ListAnnouncementsQuery) {
    return this.repo.findAll(query).then((page) => ({
      ...page,
      items: page.items.map(toOutput),
    }));
  }

  async get(id: number) {
    const row = await this.repo.findById(id);
    if (!row) throw AppErrors.NOT_FOUND('Announcement not found.');
    return toOutput(row);
  }

  async create(input: CreateAnnouncementInput) {
    const row = await this.repo.create({
      title: input.title,
      body: input.body,
      published: input.published ?? false,
    });
    return toOutput(row);
  }

  async update(id: number, input: UpdateAnnouncementInput) {
    const existing = await this.repo.findById(id);
    if (!existing) throw AppErrors.NOT_FOUND('Announcement not found.');
    const row = await this.repo.update(id, input);
    if (!row) throw AppErrors.NOT_FOUND('Announcement not found.');
    return toOutput(row);
  }

  async remove(id: number): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) throw AppErrors.NOT_FOUND('Announcement not found.');
  }
}
