import {
  IAuditLogRepository,
  ListAuditLogsQuery,
} from '@application/ports/audit-log.port';
import { RecordAuditLogUseCase } from './record-audit-log.use-case';
import {
  AuditLogOutput,
  toAuditLogOutput,
} from '../dto/audit-log-output.mapper';
import { PaginatedResult } from '@shared/types/pagination';
import { IOrganizationContext } from '@application/ports/organization-context.port';

export class ListAuditLogsUseCase {
  constructor(
    private readonly auditLogs: IAuditLogRepository,
    private readonly recordAuditLog: RecordAuditLogUseCase,
    private readonly orgContext: IOrganizationContext,
  ) {}

  async execute(
    query: ListAuditLogsQuery,
    actorUserId: number,
  ): Promise<PaginatedResult<AuditLogOutput>> {
    const organizationId =
      query.organizationId ??
      (await this.orgContext.getCurrentOrganizationId());
    const scopedQuery =
      organizationId !== null && organizationId !== undefined
        ? { ...query, organizationId }
        : query;
    const result = await this.auditLogs.findAll(scopedQuery);

    await this.recordAuditLog.execute({
      userId: actorUserId,
      action: 'AUDIT_LOG_READ',
      resource: 'audit_logs',
      resourceId: null,
      ipAddress: null,
      metadata: {
        filters: {
          page: query.page,
          limit: query.limit,
          userId: query.userId,
          resource: query.resource,
          action: query.action,
        },
        resultCount: result.items.length,
        total: result.total,
      },
    });

    return {
      ...result,
      items: result.items.map((item) => toAuditLogOutput(item)),
    };
  }
}
