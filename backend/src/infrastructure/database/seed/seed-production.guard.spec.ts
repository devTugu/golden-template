import { assertSeedAllowedForEnv } from './seed-production.guard';

describe('assertSeedAllowedForEnv', () => {
  it('allows development with defaults unset', () => {
    expect(assertSeedAllowedForEnv({ NODE_ENV: 'development' })).toEqual({
      ok: true,
    });
  });

  it('refuses production without explicit credentials', () => {
    const result = assertSeedAllowedForEnv({ NODE_ENV: 'production' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/SEED_ADMIN_EMAIL/);
    }
  });

  it('refuses production with default password', () => {
    const result = assertSeedAllowedForEnv({
      NODE_ENV: 'production',
      SEED_ADMIN_EMAIL: 'ops@example.com',
      SEED_ADMIN_PASSWORD: 'admin123!',
    });
    expect(result.ok).toBe(false);
  });

  it('allows production with strong explicit password', () => {
    expect(
      assertSeedAllowedForEnv({
        NODE_ENV: 'production',
        SEED_ADMIN_EMAIL: 'ops@example.com',
        SEED_ADMIN_PASSWORD: 'Str0ng!UniquePass',
      }),
    ).toEqual({ ok: true });
  });
});
