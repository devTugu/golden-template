import {
  ConfirmMfaEnrollUseCase,
  ConfirmMfaEnrollWithEnrollmentTokenUseCase,
  DisableMfaUseCase,
  EnrollMfaUseCase,
  EnrollMfaWithEnrollmentTokenUseCase,
} from './mfa.use-cases';

describe('Mfa use cases', () => {
  const users = {
    findById: jest.fn(),
    update: jest.fn(),
    getMfaSecretEncrypted: jest.fn(),
    findByEmailWithRolesAndPermissions: jest.fn(),
  };
  const mfa = {
    generateSecret: jest.fn().mockReturnValue({
      secret: 'secret',
      otpauthUrl: 'otpauth://totp/test',
    }),
    encryptSecret: jest.fn().mockReturnValue('encrypted'),
    decryptSecret: jest.fn().mockReturnValue('secret'),
    verifyToken: jest.fn().mockReturnValue(true),
  };

  beforeEach(() => jest.clearAllMocks());

  describe('EnrollMfaUseCase', () => {
    it('stores encrypted secret and returns otpauth URL', async () => {
      users.findById.mockResolvedValue({ id: 1, email: 'a@b.com' });
      const useCase = new EnrollMfaUseCase(users as never, mfa);

      const result = await useCase.execute(1);
      expect(result.otpauthUrl).toBe('otpauth://totp/test');
      expect(users.update).toHaveBeenCalledWith(1, {
        mfaSecretEncrypted: 'encrypted',
        mfaEnabled: false,
      });
    });

    it('throws when user missing', async () => {
      users.findById.mockResolvedValue(null);
      const useCase = new EnrollMfaUseCase(users as never, mfa);
      await expect(useCase.execute(99)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('EnrollMfaWithEnrollmentTokenUseCase', () => {
    it('enrolls from enrollment token claims', async () => {
      const tokens = {
        verifyMfaEnrollmentPending: jest.fn().mockResolvedValue({ sub: 1 }),
      };
      users.findById.mockResolvedValue({ id: 1, email: 'a@b.com' });
      const useCase = new EnrollMfaWithEnrollmentTokenUseCase(
        users as never,
        mfa,
        tokens as never,
      );
      const result = await useCase.execute('enrollment-jwt');
      expect(result.otpauthUrl).toBe('otpauth://totp/test');
    });
  });

  describe('ConfirmMfaEnrollUseCase', () => {
    it('enables MFA on valid code', async () => {
      users.getMfaSecretEncrypted.mockResolvedValue('encrypted');
      const useCase = new ConfirmMfaEnrollUseCase(users as never, mfa);

      await useCase.execute(1, '123456');
      expect(users.update).toHaveBeenCalledWith(1, { mfaEnabled: true });
    });

    it('requires prior enrollment', async () => {
      users.getMfaSecretEncrypted.mockResolvedValue(null);
      const useCase = new ConfirmMfaEnrollUseCase(users as never, mfa);
      await expect(useCase.execute(1, '123456')).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('ConfirmMfaEnrollWithEnrollmentTokenUseCase', () => {
    it('issues tokens after confirming enrollment', async () => {
      const tokens = {
        verifyMfaEnrollmentPending: jest.fn().mockResolvedValue({ sub: 1 }),
        issuePair: jest.fn().mockResolvedValue({
          accessToken: 'access',
          refreshToken: 'refresh',
          accessExpiresIn: 900,
          refreshExpiresAt: new Date(),
        }),
      };
      const permissionCache = { set: jest.fn() };
      const config = { get: jest.fn().mockReturnValue(60) };
      const recordRefresh = { record: jest.fn() };
      users.getMfaSecretEncrypted.mockResolvedValue('encrypted');
      users.findById.mockResolvedValue({ id: 1, email: 'a@b.com' });
      users.findByEmailWithRolesAndPermissions.mockResolvedValue({
        id: 1,
        email: 'a@b.com',
        roleNames: [],
        permissionCodes: [],
      });

      const useCase = new ConfirmMfaEnrollWithEnrollmentTokenUseCase(
        users as never,
        mfa,
        tokens as never,
        permissionCache as never,
        config as never,
        recordRefresh as never,
      );

      const pair = await useCase.execute('enrollment-jwt', '123456');
      expect(pair.accessToken).toBe('access');
      expect(recordRefresh.record).toHaveBeenCalled();
    });
  });

  describe('DisableMfaUseCase', () => {
    it('requires valid TOTP code to disable', async () => {
      users.getMfaSecretEncrypted.mockResolvedValue('encrypted');
      const useCase = new DisableMfaUseCase(users as never, mfa);

      await useCase.execute(1, '123456');
      expect(users.update).toHaveBeenCalledWith(1, {
        mfaEnabled: false,
        mfaSecretEncrypted: null,
      });
    });

    it('rejects disable without valid code', async () => {
      users.getMfaSecretEncrypted.mockResolvedValue('encrypted');
      mfa.verifyToken.mockReturnValue(false);
      const useCase = new DisableMfaUseCase(users as never, mfa);

      await expect(useCase.execute(1, '000000')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
