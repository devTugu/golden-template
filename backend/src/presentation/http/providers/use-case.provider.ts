import type { InjectionToken, Provider } from '@nestjs/common';

type Constructor<T> = new (...args: never[]) => T;

export function useCaseProvider<T>(
  UseCaseClass: Constructor<T>,
  inject: InjectionToken[],
): Provider {
  return {
    provide: UseCaseClass,
    useFactory: (...deps: unknown[]) => new UseCaseClass(...(deps as never[])),
    inject,
  };
}
