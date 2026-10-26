import { AnnouncementsService } from './announcements.service';
import type { AnnouncementsRepository } from './announcements.repository';

describe('AnnouncementsService', () => {
  const row = {
    id: 1,
    title: 'Hello',
    body: 'World',
    published: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  it('maps list items to ISO dates', async () => {
    const repo = {
      findAll: jest.fn().mockResolvedValue({
        items: [row],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
    } as unknown as AnnouncementsRepository;

    const service = new AnnouncementsService(repo);
    await expect(service.list({})).resolves.toMatchObject({
      items: [{ id: 1, createdAt: '2026-01-01T00:00:00.000Z' }],
    });
  });
});
