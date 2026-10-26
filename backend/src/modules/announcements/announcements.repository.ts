import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
} from '@infrastructure/database/drizzle/drizzle.tokens';
import { announcements } from '@infrastructure/database/drizzle/schema';
import type { ListAnnouncementsQuery } from '@default/types/announcements';

export type AnnouncementRow = typeof announcements.$inferSelect;

@Injectable()
export class AnnouncementsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async findAll(query: ListAnnouncementsQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const filters = [];
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      filters.push(
        or(ilike(announcements.title, term), ilike(announcements.body, term)),
      );
    }
    const whereClause = filters.length ? and(...filters) : undefined;

    const [items, totalRow] = await Promise.all([
      this.db.query.announcements.findMany({
        where: whereClause,
        orderBy: desc(announcements.createdAt),
        limit,
        offset: (page - 1) * limit,
      }),
      this.db.select({ value: count() }).from(announcements).where(whereClause),
    ]);

    const total = totalRow[0]?.value ?? 0;
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: number): Promise<AnnouncementRow | null> {
    return (
      (await this.db.query.announcements.findFirst({
        where: eq(announcements.id, id),
      })) ?? null
    );
  }

  async create(data: {
    title: string;
    body: string;
    published: boolean;
  }): Promise<AnnouncementRow> {
    const [row] = await this.db.insert(announcements).values(data).returning();
    if (!row) throw new Error('ANNOUNCEMENT_CREATE_FAILED');
    return row;
  }

  async update(
    id: number,
    data: Partial<{ title: string; body: string; published: boolean }>,
  ): Promise<AnnouncementRow | null> {
    const [row] = await this.db
      .update(announcements)
      .set(data)
      .where(eq(announcements.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    return deleted.length > 0;
  }
}
