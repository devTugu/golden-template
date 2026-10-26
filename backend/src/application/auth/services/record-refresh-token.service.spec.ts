import { RecordRefreshTokenService } from './record-refresh-token.service';

describe('RecordRefreshTokenService', () => {
  it('persists refresh token metadata', async () => {
    const refreshTokens = { save: jest.fn() };
    const service = new RecordRefreshTokenService(refreshTokens as never);
    const expiresAt = new Date();
    await service.record(1, 'token', expiresAt, {
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });
    expect(refreshTokens.save).toHaveBeenCalledWith(
      1,
      expect.any(String),
      expiresAt,
      expect.objectContaining({ ipAddress: '127.0.0.1' }),
    );
  });
});
