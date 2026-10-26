import { Module } from '@nestjs/common';
import { UserV1Controller } from '../controllers/v1/user.controller';

@Module({
  controllers: [UserV1Controller],
})
export class UserPresentationModule {}
