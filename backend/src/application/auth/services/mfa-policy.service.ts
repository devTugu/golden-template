import { DEFAULT_SITE_SETTINGS } from '@domain/site-setting/entities/site-settings.entity';
import { ISiteSettingRepository } from '@domain/site-setting/repositories/site-setting.repository.interface';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';
import { resolveMfaRequiredRolesFromPolicy } from '../lib/mfa-required-roles';

export class MfaPolicyService {
  constructor(
    private readonly siteSettings: ISiteSettingRepository,
    private readonly runtimeConfig: IRuntimeConfig,
  ) {}

  async getRequiredRoles(): Promise<string[]> {
    const settings = await this.siteSettings.get();
    const enforce =
      settings?.security.enforcePrivilegedMfa ??
      DEFAULT_SITE_SETTINGS.security.enforcePrivilegedMfa;
    return resolveMfaRequiredRolesFromPolicy(
      enforce,
      this.runtimeConfig.getMfaRequiredRolesRaw(),
    );
  }
}
