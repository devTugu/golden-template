import { Module } from '@nestjs/common';
import { MediaAdminV1Controller } from '../controllers/v1/admin/media.controller';

@Module({
  controllers: [MediaAdminV1Controller],
})
export class MediaPresentationModule {}
