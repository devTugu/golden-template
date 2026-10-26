import type { z } from 'zod';
import {
  isPlaceholderSecret,
  jwtSecretsMustDiffer,
} from './env-production.rules';

type EnvDraft = {
  NODE_ENV: 'development' | 'test' | 'production';
  REDIS_ENABLED: 'true' | 'false';
  REDIS_URL?: string;
  OTEL_ENABLED: 'true' | 'false';
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;
  OAUTH_ENABLED: 'true' | 'false';
  OAUTH_ISSUER?: string;
  OAUTH_CLIENT_ID?: string;
  OAUTH_CLIENT_SECRET?: string;
  OAUTH_CALLBACK_URL?: string;
  MFA_ENCRYPTION_KEY?: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

function requireWhen(
  ctx: z.RefinementCtx,
  condition: boolean,
  path: string,
  message: string,
): void {
  if (!condition) {
    ctx.addIssue({ code: 'custom', path: [path], message });
  }
}

export function refineConditionalEnv(
  value: EnvDraft,
  ctx: z.RefinementCtx,
): void {
  requireWhen(
    ctx,
    value.REDIS_ENABLED !== 'true' || Boolean(value.REDIS_URL),
    'REDIS_URL',
    'Required when REDIS_ENABLED is true',
  );
  requireWhen(
    ctx,
    value.OTEL_ENABLED !== 'true' || Boolean(value.OTEL_EXPORTER_OTLP_ENDPOINT),
    'OTEL_EXPORTER_OTLP_ENDPOINT',
    'Required when OTEL_ENABLED is true',
  );

  if (value.OAUTH_ENABLED !== 'true') {
    return;
  }

  requireWhen(
    ctx,
    Boolean(value.OAUTH_ISSUER),
    'OAUTH_ISSUER',
    'Required when OAUTH_ENABLED is true',
  );
  requireWhen(
    ctx,
    Boolean(value.OAUTH_CLIENT_ID),
    'OAUTH_CLIENT_ID',
    'Required when OAUTH_ENABLED is true',
  );
  requireWhen(
    ctx,
    Boolean(value.OAUTH_CLIENT_SECRET),
    'OAUTH_CLIENT_SECRET',
    'Required when OAUTH_ENABLED is true',
  );
  requireWhen(
    ctx,
    Boolean(value.OAUTH_CALLBACK_URL),
    'OAUTH_CALLBACK_URL',
    'Required when OAUTH_ENABLED is true',
  );
}

export function refineProductionEnv(
  value: EnvDraft,
  ctx: z.RefinementCtx,
): void {
  if (value.NODE_ENV !== 'production') {
    return;
  }

  requireWhen(
    ctx,
    Boolean(value.MFA_ENCRYPTION_KEY),
    'MFA_ENCRYPTION_KEY',
    'Required in production',
  );

  const prodSecrets: Array<{ key: string; value: string }> = [
    { key: 'JWT_ACCESS_SECRET', value: value.JWT_ACCESS_SECRET },
    { key: 'JWT_REFRESH_SECRET', value: value.JWT_REFRESH_SECRET },
  ];
  if (value.MFA_ENCRYPTION_KEY) {
    prodSecrets.push({
      key: 'MFA_ENCRYPTION_KEY',
      value: value.MFA_ENCRYPTION_KEY,
    });
  }

  for (const { key, value: secret } of prodSecrets) {
    if (isPlaceholderSecret(secret)) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message:
          'must not use placeholder values starting with change_me in production',
      });
    }
  }

  if (
    !jwtSecretsMustDiffer(value.JWT_ACCESS_SECRET, value.JWT_REFRESH_SECRET)
  ) {
    ctx.addIssue({
      code: 'custom',
      message:
        'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ in production',
    });
  }
}
