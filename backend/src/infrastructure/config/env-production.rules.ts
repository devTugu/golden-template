const PLACEHOLDER_PREFIX = 'change_me';

export function isPlaceholderSecret(value: string): boolean {
  return value.startsWith(PLACEHOLDER_PREFIX);
}

export function jwtSecretsMustDiffer(
  accessSecret: string,
  refreshSecret: string,
): boolean {
  return accessSecret !== refreshSecret;
}
