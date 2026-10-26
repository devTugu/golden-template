import {
  AcceptInviteSchema,
  InviteUserSchema,
  PasswordForgotSchema,
  PasswordResetSchema,
} from '@default/types/auth';
import { createZodDto } from 'nestjs-zod';

export class PasswordForgotDto extends createZodDto(
  PasswordForgotSchema.strict(),
) {}

export class PasswordResetDto extends createZodDto(
  PasswordResetSchema.strict(),
) {}

export class InviteUserDto extends createZodDto(InviteUserSchema.strict()) {}

export class AcceptInviteDto extends createZodDto(
  AcceptInviteSchema.strict(),
) {}
