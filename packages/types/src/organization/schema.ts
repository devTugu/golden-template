import { z } from "zod";
import { ListQuerySchema, PaginatedSchema } from "../common/schema";

export const OrganizationSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const CreateOrganizationInputSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(255),
});

export type CreateOrganizationInput = z.infer<
  typeof CreateOrganizationInputSchema
>;

export const UpdateOrganizationInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export type UpdateOrganizationInput = z.infer<
  typeof UpdateOrganizationInputSchema
>;

export const OrganizationMemberSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  userId: z.number(),
  userEmail: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
});

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

export const AddOrganizationMemberInputSchema = z.object({
  userId: z.number().int().positive(),
  role: z.string().min(1).max(32),
});

export type AddOrganizationMemberInput = z.infer<
  typeof AddOrganizationMemberInputSchema
>;

export const SwitchOrganizationInputSchema = z.object({
  organizationId: z.number().int().positive(),
});

export type SwitchOrganizationInput = z.infer<
  typeof SwitchOrganizationInputSchema
>;

export const OrganizationListQuerySchema = ListQuerySchema;
export const PaginatedOrganizationsSchema =
  PaginatedSchema(OrganizationSchema);
export const PaginatedOrganizationMembersSchema = PaginatedSchema(
  OrganizationMemberSchema,
);
