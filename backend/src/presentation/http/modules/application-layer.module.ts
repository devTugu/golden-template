import { Global, Module, type Provider } from '@nestjs/common';
import { AUTH_USE_CASE_PROVIDERS } from '../providers/auth-use-case.providers';
import { USER_USE_CASE_PROVIDERS } from '../providers/user-use-case.providers';
import { REMAINING_USE_CASE_PROVIDERS } from '../providers/other-use-case.providers';
import { ORGANIZATION_USE_CASE_PROVIDERS } from '../providers/organization-use-case.providers';

const USE_CASES: Provider[] = [
  ...ORGANIZATION_USE_CASE_PROVIDERS,
  ...AUTH_USE_CASE_PROVIDERS,
  ...USER_USE_CASE_PROVIDERS,
  ...REMAINING_USE_CASE_PROVIDERS,
];

@Global()
@Module({
  providers: USE_CASES,
  exports: USE_CASES.map((p) => ('provide' in p ? p.provide : p)),
})
export class ApplicationLayerModule {}
