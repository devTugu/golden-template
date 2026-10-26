import {
  CreateAnnouncementInputSchema,
  ListAnnouncementsQuerySchema,
  UpdateAnnouncementInputSchema,
} from '@default/types/announcements';
import { createZodDto } from 'nestjs-zod';

export class ListAnnouncementsQueryDto extends createZodDto(
  ListAnnouncementsQuerySchema,
) {}

export class CreateAnnouncementDto extends createZodDto(
  CreateAnnouncementInputSchema.strict(),
) {}

export class UpdateAnnouncementDto extends createZodDto(
  UpdateAnnouncementInputSchema.strict(),
) {}
