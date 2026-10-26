import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, gt } from 'drizzle-orm';
import {
  AuthTokenRecord,
  AuthTokenType,
  IAuthTokenRepository,
} from '@application/ports/auth-token.port';
import {
  DRIZZLE,
  type DrizzleDatabase,
} from '../database/drizzle/drizzle.tokens';
import { authTokens } from '../database/drizzle/schema';

@Injectable()
export class AuthTokenDrizzleRepository implements IAuthTokenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async create(input: {
    userId: number;
    type: AuthTokenType;
    tokenHash: string;
    expiresAt: Date;
    createdBy?: number | null;
  }): Promise<AuthTokenRecord> {
    const [row] = await this.db
      .insert(authTokens)
      .values({
        userId: input.userId,
        type: input.type,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdBy: input.createdBy ?? null,
      })
      .returning();
    if (!row) throw new Error('AUTH_TOKEN_CREATE_FAILED');
    return this.toRecord(row);
  }

  async findValidByHash(tokenHash: string): Promise<AuthTokenRecord | null> {
    const row = await this.db.query.authTokens.findFirst({
      where: and(
        eq(authTokens.tokenHash, tokenHash),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    });
    return row ? this.toRecord(row) : null;
  }

  async markUsed(id: number, usedAt: Date): Promise<void> {
    await this.db
      .update(authTokens)
      .set({ usedAt })
      .where(eq(authTokens.id, id));
  }

  async invalidateActiveForUser(
    userId: number,
    type: AuthTokenType,
  ): Promise<void> {
    await this.db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(authTokens.userId, userId),
          eq(authTokens.type, type),
          isNull(authTokens.usedAt),
        ),
      );
  }

  private toRecord(row: typeof authTokens.$inferSelect): AuthTokenRecord {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as AuthTokenType,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
    };
  }
}
