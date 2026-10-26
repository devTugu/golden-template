import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RoleV1Controller } from '../controllers/v1/role.controller';
import { PermissionV1Controller } from '../controllers/v1/permission.controller';
import { HealthV1Controller } from '../controllers/v1/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [RoleV1Controller, PermissionV1Controller, HealthV1Controller],
})
export class AuthorizationPresentationModule {}
