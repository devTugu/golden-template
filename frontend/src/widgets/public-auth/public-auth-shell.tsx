'use client';

import Login04 from '@default/ui/composed/login/login-04';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';

type PublicAuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function PublicAuthShell({
  title,
  subtitle,
  children,
}: PublicAuthShellProps) {
  return (
    <Login04
      homeHref={ROUTES.HOME}
      title={title}
      subtitle={subtitle}
      panelTitle={env.APP_NAME}
      credentials={children}
    />
  );
}
