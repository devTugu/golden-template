import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditLogAdminV1Controller } from '../controllers/v1/admin/audit-log.controller';
import { AuditRetentionScheduler } from '@infrastructure/audit/audit-retention.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AuditLogAdminV1Controller],
  providers: [AuditRetentionScheduler],
})
export class AuditPresentationModule {}
