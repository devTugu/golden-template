import { ISiteSettingRepository } from '@domain/site-setting/repositories/site-setting.repository.interface';
import { DEFAULT_SITE_SETTINGS } from '@domain/site-setting/entities/site-settings.entity';
import {
  SiteSettingsOutput,
  toPublicSiteSettingsOutput,
  toSiteSettingsOutput,
  type PublicSiteSettingsOutput,
} from '../dto/site-settings-output.mapper';

function defaultPublicSettingsOutput(): PublicSiteSettingsOutput {
  const { security: _security, ...rest } = defaultSettingsOutput();
  return rest;
}

function defaultSettingsOutput(): SiteSettingsOutput {
  return {
    id: DEFAULT_SITE_SETTINGS.id,
    hero: { ...DEFAULT_SITE_SETTINGS.hero },
    header: { ...DEFAULT_SITE_SETTINGS.header },
    footer: {
      ...DEFAULT_SITE_SETTINGS.footer,
      socialLinks: [...DEFAULT_SITE_SETTINGS.footer.socialLinks],
    },
    seo: {
      ...DEFAULT_SITE_SETTINGS.seo,
      keywords: { ...DEFAULT_SITE_SETTINGS.seo.keywords },
    },
    contactInfo: { ...DEFAULT_SITE_SETTINGS.contactInfo },
    theme: { ...DEFAULT_SITE_SETTINGS.theme },
    about: {
      ...DEFAULT_SITE_SETTINGS.about,
      values: [...DEFAULT_SITE_SETTINGS.about.values],
      stats: [...DEFAULT_SITE_SETTINGS.about.stats],
    },
    security: { ...DEFAULT_SITE_SETTINGS.security },
    updatedAt: new Date().toISOString(),
  };
}

export class GetPublicSiteSettingsUseCase {
  constructor(private readonly siteSettings: ISiteSettingRepository) {}

  async execute(): Promise<PublicSiteSettingsOutput> {
    const settings = await this.siteSettings.get();
    if (!settings) {
      return defaultPublicSettingsOutput();
    }
    return toPublicSiteSettingsOutput(settings);
  }
}

export class GetSiteSettingsUseCase {
  constructor(private readonly siteSettings: ISiteSettingRepository) {}

  async execute(): Promise<SiteSettingsOutput> {
    const settings = await this.siteSettings.get();
    if (!settings) {
      return defaultSettingsOutput();
    }
    return toSiteSettingsOutput(settings);
  }
}

export class UpdateSiteSettingsUseCase {
  constructor(private readonly siteSettings: ISiteSettingRepository) {}

  async execute(input: {
    hero?: Partial<SiteSettingsOutput['hero']>;
    header?: Partial<SiteSettingsOutput['header']>;
    footer?: Partial<SiteSettingsOutput['footer']>;
    seo?: Partial<SiteSettingsOutput['seo']>;
    contactInfo?: Partial<SiteSettingsOutput['contactInfo']>;
    theme?: Partial<SiteSettingsOutput['theme']>;
    about?: Partial<SiteSettingsOutput['about']>;
    security?: Partial<SiteSettingsOutput['security']>;
  }): Promise<SiteSettingsOutput> {
    const settings = await this.siteSettings.upsert(input);
    return toSiteSettingsOutput(settings);
  }
}
