import { Module } from '@nestjs/common';
import { DashboardAdminV1Controller } from '../controllers/v1/admin/dashboard.controller';

@Module({
  controllers: [DashboardAdminV1Controller],
})
export class DashboardPresentationModule {}
