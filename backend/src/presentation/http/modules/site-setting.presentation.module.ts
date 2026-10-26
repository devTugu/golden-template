import { Module } from '@nestjs/common';
import { SiteSettingPublicV1Controller } from '../controllers/v1/public/site-settings.controller';
import { SiteSettingAdminV1Controller } from '../controllers/v1/admin/site-settings.controller';

@Module({
  controllers: [SiteSettingPublicV1Controller, SiteSettingAdminV1Controller],
})
export class SiteSettingPresentationModule {}
