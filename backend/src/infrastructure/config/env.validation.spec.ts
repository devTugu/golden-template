import { envSchema, validateEnv } from './env.validation';

const validBase = {
  DB_HOST: '127.0.0.1',
  DB_USERNAME: 'app_user',
  DB_PASSWORD: 'secret',
  DB_NAME: 'app_db',
  JWT_ACCESS_SECRET: 'test_access_secret_minimum_32_characters',
  JWT_REFRESH_SECRET: 'test_refresh_secret_minimum_32_chars',
  REDIS_ENABLED: 'true',
  REDIS_URL: 'redis://127.0.0.1:6379',
};

describe('envSchema', () => {
  it('accepts a minimal valid production configuration', () => {
    const result = envSchema.safeParse({
      ...validBase,
      NODE_ENV: 'production',
      MFA_ENCRYPTION_KEY: 'production_mfa_encryption_key_32chars',
    });

    expect(result.success).toBe(true);
  });

  it('rejects placeholder JWT secrets in production', () => {
    const result = envSchema.safeParse({
      ...validBase,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'change_me_access_secret_min_32_chars',
      MFA_ENCRYPTION_KEY: 'production_mfa_encryption_key_32chars',
    });

    expect(result.success).toBe(false);
  });

  it('requires MFA_ENCRYPTION_KEY in production', () => {
    const result = envSchema.safeParse({
      ...validBase,
      NODE_ENV: 'production',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.includes('MFA_ENCRYPTION_KEY')),
      ).toBe(true);
    }
  });

  it('requires distinct JWT secrets in production', () => {
    const secret = 'shared_production_jwt_secret_32chars!!';
    const result = envSchema.safeParse({
      ...validBase,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: secret,
      JWT_REFRESH_SECRET: secret,
      MFA_ENCRYPTION_KEY: 'production_mfa_encryption_key_32chars',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing JWT secrets (fail-closed)', () => {
    const result = envSchema.safeParse({
      ...validBase,
      JWT_ACCESS_SECRET: undefined,
    });

    expect(result.success).toBe(false);
  });

  it('requires Redis URL when REDIS_ENABLED is true', () => {
    const result = envSchema.safeParse({
      ...validBase,
      REDIS_URL: undefined,
    });

    expect(result.success).toBe(false);
  });

  it('requires OAuth fields when OAUTH_ENABLED is true', () => {
    const result = envSchema.safeParse({
      ...validBase,
      OAUTH_ENABLED: 'true',
    });

    expect(result.success).toBe(false);
  });

  it('requires OTEL endpoint when OTEL_ENABLED is true', () => {
    const result = envSchema.safeParse({
      ...validBase,
      OTEL_ENABLED: 'true',
    });

    expect(result.success).toBe(false);
  });
});

describe('validateEnv', () => {
  it('throws with readable message on invalid config', () => {
    expect(() => validateEnv({})).toThrow(/Config validation error/);
  });
});
