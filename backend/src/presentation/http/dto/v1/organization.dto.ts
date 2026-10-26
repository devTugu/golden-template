import { createZodDto } from 'nestjs-zod';
import {
  AddOrganizationMemberInputSchema,
  CreateOrganizationInputSchema,
  OrganizationListQuerySchema,
  SwitchOrganizationInputSchema,
  UpdateOrganizationInputSchema,
} from '@default/types/organization';

export class CreateOrganizationDto extends createZodDto(
  CreateOrganizationInputSchema.strict(),
) {}

export class UpdateOrganizationDto extends createZodDto(
  UpdateOrganizationInputSchema.strict(),
) {}

export class AddOrganizationMemberDto extends createZodDto(
  AddOrganizationMemberInputSchema.strict(),
) {}

export class SwitchOrganizationDto extends createZodDto(
  SwitchOrganizationInputSchema.strict(),
) {}

export class ListOrganizationsQueryDto extends createZodDto(
  OrganizationListQuerySchema.strict(),
) {}
