export const PUBLIC_ROUTES = {
  HOME: '/',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const ROUTES = {
  HOME: '/',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  LOGIN: '/sign-in',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCEPT_INVITE: '/accept-invite',
  OAUTH_CALLBACK: '/oauth/callback',
  DASHBOARD: '/dashboard',
  SECURITY: '/dashboard/security',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  PERMISSIONS: '/dashboard/permissions',
  SITE_SETTINGS: '/dashboard/site-settings',
  AUDIT_LOGS: '/dashboard/audit-logs',
  ANNOUNCEMENTS: '/dashboard/announcements',
  /** Audit logs live under site settings (legacy `/audit-logs` redirects here). */
  SITE_SETTINGS_AUDIT: '/dashboard/site-settings?tab=audit',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
