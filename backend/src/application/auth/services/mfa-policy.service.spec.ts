import { MfaPolicyService } from './mfa-policy.service';

describe('MfaPolicyService', () => {
  it('uses site settings policy when available', async () => {
    const siteSettings = {
      get: jest.fn().mockResolvedValue({
        security: { enforcePrivilegedMfa: true },
      }),
    };
    const runtimeConfig = {
      getMfaRequiredRolesRaw: jest.fn().mockReturnValue('ADMIN'),
    };
    const service = new MfaPolicyService(
      siteSettings as never,
      runtimeConfig as never,
    );
    await expect(service.getRequiredRoles()).resolves.toEqual(['ADMIN']);
  });

  it('falls back to defaults when settings missing', async () => {
    const siteSettings = { get: jest.fn().mockResolvedValue(null) };
    const runtimeConfig = {
      getMfaRequiredRolesRaw: jest.fn().mockReturnValue(''),
    };
    const service = new MfaPolicyService(
      siteSettings as never,
      runtimeConfig as never,
    );
    const roles = await service.getRequiredRoles();
    expect(Array.isArray(roles)).toBe(true);
  });
});
