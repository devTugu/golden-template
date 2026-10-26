import type { IAuditLogRepository } from '@application/ports/audit-log.port';
import { IRuntimeConfig } from '@application/ports/runtime-config.port';

export class PurgeAuditLogsUseCase {
  constructor(
    private readonly auditLogs: IAuditLogRepository,
    private readonly runtimeConfig: IRuntimeConfig,
  ) {}

  async execute(): Promise<number> {
    const retentionDays = this.runtimeConfig.getAuditRetentionDays();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    return this.auditLogs.deleteOlderThan(cutoff);
  }
}
