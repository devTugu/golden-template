import { envValidationSchema } from './env.validation';

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

describe('envValidationSchema', () => {
  it('accepts a minimal valid production configuration', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      NODE_ENV: 'production',
      MFA_ENCRYPTION_KEY: 'production_mfa_encryption_key_32chars',
    });

    expect(error).toBeUndefined();
  });

  it('rejects placeholder JWT secrets in production', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'change_me_access_secret_min_32_chars',
      MFA_ENCRYPTION_KEY: 'production_mfa_encryption_key_32chars',
    });

    expect(error).toBeDefined();
  });

  it('requires MFA_ENCRYPTION_KEY in production', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      NODE_ENV: 'production',
    });

    expect(error).toBeDefined();
    expect(error?.message).toMatch(/MFA_ENCRYPTION_KEY/);
  });

  it('requires distinct JWT secrets in production', () => {
    const secret = 'shared_production_jwt_secret_32chars!!';
    const { error } = envValidationSchema.validate({
      ...validBase,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: secret,
      JWT_REFRESH_SECRET: secret,
      MFA_ENCRYPTION_KEY: 'production_mfa_encryption_key_32chars',
    });

    expect(error).toBeDefined();
  });

  it('rejects missing JWT secrets (fail-closed)', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      JWT_ACCESS_SECRET: undefined,
    });

    expect(error).toBeDefined();
    expect(error?.message).toMatch(/JWT_ACCESS_SECRET/);
  });

  it('requires Redis URL when REDIS_ENABLED is true', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      REDIS_URL: undefined,
    });

    expect(error).toBeDefined();
    expect(error?.message).toMatch(/REDIS_URL/);
  });

  it('requires OAuth fields when OAUTH_ENABLED is true', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      OAUTH_ENABLED: 'true',
    });

    expect(error).toBeDefined();
    expect(error?.message).toMatch(/OAUTH_ISSUER/);
  });
});
