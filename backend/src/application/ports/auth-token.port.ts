export type AuthTokenType = 'password_reset' | 'invite';

export interface AuthTokenRecord {
  id: number;
  userId: number;
  type: AuthTokenType;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdBy: number | null;
  createdAt: Date;
}

export interface IAuthTokenRepository {
  create(input: {
    userId: number;
    type: AuthTokenType;
    tokenHash: string;
    expiresAt: Date;
    createdBy?: number | null;
  }): Promise<AuthTokenRecord>;
  findValidByHash(tokenHash: string): Promise<AuthTokenRecord | null>;
  markUsed(id: number, usedAt: Date): Promise<void>;
  invalidateActiveForUser(userId: number, type: AuthTokenType): Promise<void>;
}
