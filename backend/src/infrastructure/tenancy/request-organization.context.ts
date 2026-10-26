import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { IOrganizationContext } from '@application/ports/organization-context.port';
import { JwtPayload } from '@shared/types/pagination';

type RequestWithUser = Request & { user?: JwtPayload };

@Injectable({ scope: Scope.REQUEST })
export class RequestOrganizationContext implements IOrganizationContext {
  constructor(@Inject(REQUEST) private readonly request: RequestWithUser) {}

  getCurrentOrganizationId(): Promise<number | null> {
    return Promise.resolve(this.request.user?.organizationId ?? null);
  }
}
