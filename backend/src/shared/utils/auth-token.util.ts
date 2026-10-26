import * as crypto from 'crypto';

export function generateAuthTokenRaw(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashAuthToken(raw: string): string {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}
