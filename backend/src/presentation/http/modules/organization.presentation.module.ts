import { Module } from '@nestjs/common';
import { OrganizationAdminV1Controller } from '../controllers/v1/admin/organization.controller';

@Module({
  controllers: [OrganizationAdminV1Controller],
})
export class OrganizationPresentationModule {}
