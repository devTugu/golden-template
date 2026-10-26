const KNOWN_DEFAULT_PASSWORDS = new Set(['admin123!', 'viewer123!']);

export type SeedGuardEnv = Readonly<{
  NODE_ENV?: string;
  SEED_ADMIN_EMAIL?: string;
  SEED_ADMIN_PASSWORD?: string;
}>;

export type SeedGuardResult = { ok: true } | { ok: false; message: string };

export function assertSeedAllowedForEnv(env: SeedGuardEnv): SeedGuardResult {
  if (env.NODE_ENV !== 'production') {
    return { ok: true };
  }

  const email = env.SEED_ADMIN_EMAIL?.trim();
  const password = env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    return {
      ok: false,
      message:
        'Refusing to seed in production: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD explicitly.',
    };
  }

  if (password.length < 12) {
    return {
      ok: false,
      message:
        'Refusing to seed in production: SEED_ADMIN_PASSWORD must be at least 12 characters.',
    };
  }

  if (KNOWN_DEFAULT_PASSWORDS.has(password)) {
    return {
      ok: false,
      message:
        'Refusing to seed in production: SEED_ADMIN_PASSWORD must not be a known default.',
    };
  }

  return { ok: true };
}
