import { Email } from '@domain/value-objects/email.vo';
import { PasswordPolicy } from '@domain/user/value-objects/password-policy.vo';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { CreateUserInput, UserOutput } from '@application/dto/user.dto';
import { toUserOutput } from '@application/dto/user-output.mapper';

export class CreateUserUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<UserOutput> {
    try {
      PasswordPolicy.validate(input.password);
    } catch (error) {
      throw AppErrors.BAD_REQUEST(
        error instanceof Error ? error.message : 'Invalid password.',
      );
    }

    const email = Email.create(input.email);
    if (await this.users.emailExists(email.value)) {
      throw AppErrors.CONFLICT('Email is already registered.');
    }
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email: email.value,
      passwordHash,
      isActive: input.isActive ?? true,
    });
    return toUserOutput(user);
  }
}
