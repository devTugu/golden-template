import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthSessionsV1Controller } from '../controllers/v1/auth-sessions.controller';
import { AuthV1Controller } from '../controllers/v1/auth.controller';
import { JwtStrategy } from '@infrastructure/auth/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthV1Controller, AuthSessionsV1Controller],
  providers: [JwtStrategy],
})
export class AuthPresentationModule {}
