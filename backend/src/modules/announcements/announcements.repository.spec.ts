import { AnnouncementsRepository } from './announcements.repository';

describe('AnnouncementsRepository', () => {
  it('applies search filter when provided', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const db = {
      query: { announcements: { findMany } },
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ value: 0 }]),
        }),
      }),
    };

    const repo = new AnnouncementsRepository(db as never);
    await repo.findAll({ search: 'launch' });
    expect(findMany).toHaveBeenCalled();
  });
});
