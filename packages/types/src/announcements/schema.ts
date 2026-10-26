import { z } from "zod";
import { PaginatedSchema } from "../common";

export const AnnouncementSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  published: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;

export const AnnouncementPageSchema = PaginatedSchema(AnnouncementSchema);
export type AnnouncementPage = z.infer<typeof AnnouncementPageSchema>;

export const CreateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  published: z.boolean().optional(),
});

export type CreateAnnouncementInput = z.infer<
  typeof CreateAnnouncementInputSchema
>;

export const UpdateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export type UpdateAnnouncementInput = z.infer<
  typeof UpdateAnnouncementInputSchema
>;

export const ListAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export type ListAnnouncementsQuery = z.infer<
  typeof ListAnnouncementsQuerySchema
>;
