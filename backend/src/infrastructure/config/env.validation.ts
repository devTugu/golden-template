import { z } from 'zod';
import {
  refineConditionalEnv,
  refineProductionEnv,
} from './env-validation.refine';

const durationPattern = /^(\d+)(s|m|h|d)$/i;
const boolString = z.enum(['true', 'false']);

const envSchemaBase = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),
  DB_SSL: boolString.default('false'),
  DB_CONNECTION_LIMIT: z.coerce.number().int().default(10),
  DB_ROOT_PASSWORD: z.string().optional(),

  REDIS_ENABLED: boolString.default('true'),
  REDIS_URL: z.string().url().optional(),
  PERMISSION_CACHE_TTL_SEC: z.coerce.number().int().default(60),

  OTEL_ENABLED: boolString.default('false'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default('website-api'),

  OAUTH_ENABLED: boolString.default('false'),
  OAUTH_ISSUER: z.string().url().optional(),
  OAUTH_CLIENT_ID: z.string().min(1).optional(),
  OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
  OAUTH_CALLBACK_URL: z.string().url().optional(),

  APP_DISPLAY_NAME: z.string().default('Website Template'),
  MFA_ISSUER: z.string().default('Website Template Admin'),
  MFA_ENCRYPTION_KEY: z.string().min(32).optional(),
  MFA_REQUIRED_ROLES: z.string().default(''),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().regex(durationPattern).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().regex(durationPattern).default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  THROTTLE_TTL: z.coerce.number().int().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().default(60),
  LOGIN_THROTTLE_TTL: z.coerce.number().int().default(60),
  LOGIN_THROTTLE_LIMIT: z.coerce.number().int().default(5),
  LOGIN_MAX_FAILED_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().min(1).default(15),

  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).default(60),
  INVITE_TTL_HOURS: z.coerce.number().int().min(1).default(72),

  SWAGGER_ENABLED: boolString.default('false'),

  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  CONTACT_NOTIFY_EMAIL: z.string().email().optional(),

  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),
  MEDIA_MAX_BYTES: z.coerce
    .number()
    .int()
    .min(1024)
    .default(5 * 1024 * 1024),

  AUDIT_PURGE_ENABLED: boolString.default('false'),
  AUDIT_RETENTION_DAYS: z.coerce.number().int().min(1).default(90),

  SENTRY_DSN: z.string().url().optional(),
});

export const envSchema = envSchemaBase.superRefine((value, ctx) => {
  refineConditionalEnv(value, ctx);
  refineProductionEnv(value, ctx);
});

export type EnvConfig = z.infer<typeof envSchema>;

function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join('.') : 'env';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Config validation error: ${formatValidationError(result.error)}`,
    );
  }
  return result.data;
}
