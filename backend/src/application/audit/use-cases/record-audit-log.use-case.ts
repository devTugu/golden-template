import {
  IAuditLogRepository,
  AuditLogRecord,
} from '@application/ports/audit-log.port';

export class RecordAuditLogUseCase {
  constructor(private readonly auditLogs: IAuditLogRepository) {}

  async execute(record: AuditLogRecord): Promise<void> {
    try {
      await this.auditLogs.save(record);
    } catch (error) {
      console.warn(
        `Audit log failed: ${record.action} ${record.resource}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
