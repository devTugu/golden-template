import { MfaPolicyService } from './mfa-policy.service';

describe('MfaPolicyService', () => {
  it('merges site settings with env MFA roles', async () => {
    const siteSettings = {
      get: jest.fn().mockResolvedValue({
        security: { enforcePrivilegedMfa: true },
      }),
    };
    const config = {
      get: jest.fn().mockReturnValue('admin,superadmin'),
    };
    const service = new MfaPolicyService(
      siteSettings as never,
      config as never,
    );
    const roles = await service.getRequiredRoles();
    expect(roles.length).toBeGreaterThan(0);
  });
});
