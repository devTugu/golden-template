import {
  isMfaEnrollmentRequired,
  isMfaRequired,
  isTokenPair,
  type LoginResult,
} from './login-result';

describe('login-result type guards', () => {
  it('detects MFA challenge', () => {
    const result: LoginResult = { requiresMfa: true, mfaToken: 't' };
    expect(isMfaRequired(result)).toBe(true);
    expect(isMfaEnrollmentRequired(result)).toBe(false);
    expect(isTokenPair(result)).toBe(false);
  });

  it('detects MFA enrollment', () => {
    const result: LoginResult = {
      requiresMfaEnrollment: true,
      enrollmentToken: 'e',
    };
    expect(isMfaEnrollmentRequired(result)).toBe(true);
    expect(isMfaRequired(result)).toBe(false);
  });

  it('detects token pair', () => {
    const result: LoginResult = {
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
    };
    expect(isTokenPair(result)).toBe(true);
  });
});
