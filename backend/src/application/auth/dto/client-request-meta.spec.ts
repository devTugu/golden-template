import { mergeSessionMeta } from './client-request-meta';

describe('mergeSessionMeta', () => {
  it('prefers incoming meta over previous', () => {
    expect(
      mergeSessionMeta(
        { userAgent: 'new', ipAddress: '1.1.1.1' },
        { userAgent: 'old', ipAddress: '2.2.2.2' },
      ),
    ).toEqual({ userAgent: 'new', ipAddress: '1.1.1.1' });
  });

  it('falls back to previous or null', () => {
    expect(mergeSessionMeta(undefined, { userAgent: 'ua' })).toEqual({
      userAgent: 'ua',
      ipAddress: null,
    });
    expect(mergeSessionMeta(undefined, null)).toEqual({
      userAgent: null,
      ipAddress: null,
    });
  });
});
