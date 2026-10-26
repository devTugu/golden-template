#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.resolve(process.argv[2] ?? path.join(root, "..", "golden-template-ui-docs"));

const mainPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const docsFrontendPkgPath = path.join(dest, "frontend/package.json");
const pkg = JSON.parse(fs.readFileSync(docsFrontendPkgPath, "utf8"));
pkg.name = "docs-frontend";
pkg.description = "Golden Template UI catalog - /docs previews";
pkg.repository = {
  type: "git",
  url: "https://github.com/devTugu/golden-template-ui-docs.git",
};
for (const key of ["@default/api", "@default/hooks"]) {
  delete pkg.dependencies[key];
}
if (!pkg.dependencies["@default/types"]) {
  pkg.dependencies["@default/types"] = "workspace:*";
}
for (const key of [
  "@sentry/nextjs",
  "axios",
  "@tanstack/react-query",
  "@tanstack/react-table",
  "@tanstack/table-core",
  "react-qr-code",
  "zustand",
]) {
  delete pkg.dependencies[key];
}
for (const key of [
  "@playwright/test",
  "@opentelemetry/auto-instrumentations-node",
  "@opentelemetry/exporter-trace-otlp-http",
  "@opentelemetry/resources",
  "@opentelemetry/sdk-node",
  "@opentelemetry/semantic-conventions",
  "otplib",
  "@vitest/coverage-v8",
]) {
  delete pkg.devDependencies[key];
}
pkg.scripts = {
  dev: "NEXT_SERVER_MODE=dev next dev --port 3002",
  build: "NEXT_SERVER_MODE=dev next build",
  start: "NEXT_SERVER_MODE=dev next start --port 3002",
  postinstall: "node scripts/verify-lightningcss.js",
  lint: "eslint --max-warnings 0",
  typecheck: "tsc --noEmit",
};
fs.writeFileSync(docsFrontendPkgPath, JSON.stringify(pkg, null, 2) + "\n");

const rootPkg = {
  name: "golden-template-ui-docs",
  version: "1.3.0",
  private: true,
  description: "UI catalog for Golden Template",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/devTugu/golden-template-ui-docs.git",
  },
  packageManager: "pnpm@9.15.9",
  engines: { node: ">=20" },
  scripts: {
    dev: "pnpm run generate:tokens && pnpm --filter docs-frontend dev",
    build: "pnpm run generate:tokens && turbo run build --filter=docs-frontend",
    lint: "turbo run lint --filter=docs-frontend --filter=@default/ui",
    typecheck: "pnpm --filter docs-frontend typecheck",
    "generate:tokens": "pnpm --filter @default/design-tokens generate",
    "sync:ui-exports": "node scripts/sync-ui-package-exports.mjs",
    "ui:inventory": "node scripts/ui-import-inventory.mjs",
  },
  devDependencies: { turbo: "^2.5.4" },
  pnpm: mainPkg.pnpm,
};
fs.writeFileSync(path.join(dest, "package.json"), JSON.stringify(rootPkg, null, 2) + "\n");

fs.writeFileSync(
  path.join(dest, "pnpm-workspace.yaml"),
  "packages:\n  - frontend\n  - packages/*\n  - packages/config/*\n",
);

const turboJson = {
  $schema: "https://turbo.build/schema.json",
  tasks: {
    build: {
      dependsOn: ["^build"],
      outputs: [".next/**", "!.next/cache/**", "dist/**"],
    },
    "@default/ui#build": {
      dependsOn: [
        "@default/design-tokens#build",
        "@default/ui-charts#build",
        "@default/ui-motion-3d#build",
      ],
      outputs: ["dist/**"],
    },
    dev: { cache: false, persistent: true },
    lint: { cache: false },
    typecheck: { cache: false },
    test: { cache: false },
    generate: { cache: false },
  },
};
fs.writeFileSync(
  path.join(dest, "turbo.json"),
  JSON.stringify(turboJson, null, 2) + "\n",
);

fs.writeFileSync(
  path.join(dest, "README.md"),
  `# golden-template-ui-docs

UI catalog for [Golden Template](https://github.com/devTugu/golden-template).

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Open http://localhost:3002/docs (runs beside golden-template on :3000).

Re-sync from golden-template:

\`\`\`bash
# in golden-template repo
bash scripts/populate-golden-template-ui-docs.sh /path/to/golden-template-ui-docs

# in this repo (scripts copied on sync)
GOLDEN_TEMPLATE_ROOT=/path/to/golden-template bash scripts/populate-golden-template-ui-docs.sh .
\`\`\`
`,
);

const docsRootLayout = `import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { DocsProviders } from '@/processes/docs-providers';
import { ThemeBlockingScript } from '@/shared/ui/theme-blocking-script';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'Golden Template UI docs',
  description: '@default/ui component catalog',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeBlockingScript />
      </head>
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} min-h-svh antialiased\`}
      >
        <DocsProviders>{children}</DocsProviders>
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(dest, "frontend/app/layout.tsx"), docsRootLayout);

const docsProviders = `'use client';

import { MotionConfig } from 'motion/react';
import { AppThemeProvider } from '@/shared/ui/app-theme-provider';
import type { ReactNode } from 'react';
import { Toaster } from '@/shared/ui/sonner';
import { TooltipProvider } from '@default/ui/primitives/tooltip';

export function DocsProviders({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </MotionConfig>
    </AppThemeProvider>
  );
}
`;
fs.writeFileSync(
  path.join(dest, "frontend/src/processes/docs-providers.tsx"),
  docsProviders,
);

const docsEnv = fs.readFileSync(
  path.join(root, "frontend/src/shared/config/env.ts"),
  "utf8",
);
const docsEnvPatched = docsEnv.replace(
  /const serverEnvSchema = z.object\([\s\S]*?\}\);/,
  `const serverEnvSchema = z.object({
  API_INTERNAL_URL: z.string().url().optional(),
});`,
);
const docsEnvFinal = docsEnvPatched.replace(
  "  return parsed.data.API_INTERNAL_URL;",
  "  return parsed.data.API_INTERNAL_URL ?? raw;",
);
fs.writeFileSync(
  path.join(dest, "frontend/src/shared/config/env.ts"),
  docsEnvFinal,
);

function rmRel(rel) {
  const p = path.join(dest, rel);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

for (const rel of [
  "frontend/src/shared/api",
  "frontend/src/shared/observability",
  "frontend/src/shared/seo",
  "frontend/src/shared/styles",
  "frontend/src/shared/ui/data-table",
  "frontend/src/shared/ui/admin-content-locale-tabs",
  "frontend/src/shared/ui/admin-form-sheet",
  "frontend/src/shared/ui/admin-table-actions",
  "frontend/src/shared/ui/form-fields",
  "frontend/src/shared/ui/interactive-jump-pagination",
  "frontend/src/shared/ui/brand-logo.tsx",
  "frontend/src/shared/ui/markdown-content.tsx",
  "frontend/src/shared/ui/markdown-content.spec.ts",
  "frontend/src/shared/ui/motion.tsx",
  "frontend/src/shared/ui/published-status-badge.tsx",
  "frontend/src/shared/ui/settings-section.tsx",
  "frontend/src/shared/ui/sidebar.tsx",
  "frontend/scripts/ci-e2e.sh",
  "frontend/playwright.config.ts",
  "frontend/playwright.docs.config.ts",
  "frontend/instrumentation.ts",
  "frontend/proxy.ts",
  "frontend/.next",
  "packages/config/eslint-config/node_modules",
]) {
  rmRel(rel);
}

for (const rel of [
  "frontend/src/processes/providers.tsx",
  "frontend/src/processes/proxy.ts",
  "frontend/src/processes/routes.ts",
  "frontend/src/shared/ui/brand-theme-applier.tsx",
  "frontend/src/shared/config/api.config.ts",
  "frontend/src/shared/config/bff-allowlist.ts",
  "frontend/src/shared/config/permissions.ts",
  "frontend/src/shared/lib/constants.ts",
  "frontend/src/shared/lib/auth-cookies.ts",
  "frontend/src/shared/lib/internal-api.ts",
  "frontend/src/shared/lib/clear-client-session.ts",
  "frontend/src/shared/lib/server-session.ts",
  "frontend/src/shared/lib/bff-auth.ts",
  "frontend/src/shared/lib/bff-auth-response.ts",
  "frontend/src/shared/lib/bff-auth-server.ts",
  "frontend/src/shared/lib/bff-auth-sessions.ts",
  "frontend/src/shared/lib/bff-proxy.ts",
  "frontend/src/shared/lib/bff-refresh.ts",
  "frontend/src/shared/lib/bff-upstream.ts",
  "frontend/src/shared/lib/bff-csrf.ts",
  "frontend/src/shared/lib/bff-client-meta.ts",
  "frontend/src/shared/lib/bff-csrf.spec.ts",
  "frontend/src/shared/lib/bff-client-meta.spec.ts",
  "frontend/src/shared/lib/bff-refresh.spec.ts",
  "frontend/src/shared/lib/bff-auth-server.spec.ts",
  "frontend/src/shared/lib/internal-api.spec.ts",
  "frontend/src/shared/config/bff-allowlist.spec.ts",
  "frontend/src/shared/config/dashboard-shell.ts",
  "frontend/src/shared/config/docs-catalog.spec.ts",
  "frontend/src/shared/config/env.spec.ts",
  "frontend/src/shared/config/production-csp.spec.ts",
  "frontend/src/shared/config/server-mode.spec.ts",
  "frontend/src/shared/config/brand.spec.ts",
  "frontend/src/shared/i18n/admin-content-locale-context.tsx",
  "frontend/src/shared/i18n/locale-switcher.tsx",
  "frontend/src/shared/i18n/messages.spec.ts",
  "frontend/src/shared/i18n/use-format-date.ts",
  "frontend/src/shared/i18n/validation-messages.ts",
]) {
  rmRel(rel);
}

for (const rel of [
  "frontend/src/shared/hooks/table-query-params.util.ts",
  "frontend/src/shared/hooks/table-query-params.util.spec.ts",
  "frontend/src/shared/hooks/table-search-params.parse.ts",
  "frontend/src/shared/hooks/use-table-pagination.ts",
  "frontend/src/shared/hooks/use-table-search-params-actions.ts",
  "frontend/src/shared/hooks/use-table-search-params.ts",
  "frontend/src/shared/hooks/useDebounce.ts",
  "frontend/src/shared/hooks/useLocalStorage.ts",
]) {
  rmRel(rel);
}

fs.writeFileSync(
  path.join(dest, "frontend/src/shared/hooks/index.ts"),
  `export { useIsMounted } from './use-is-mounted';
export { useIsMobile } from './use-mobile';
export { usePrefersReducedMotion } from './use-prefers-reduced-motion';
`,
);

const docsMessagesTs = `import en from './messages/en.json';
import { defaultLocale, locales, type Locale } from './config';

const catalogs = { en } as const;

export type AppMessages = typeof en;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (value && isLocale(value)) {
    return value;
  }
  return defaultLocale;
}

export function getMessages(locale: Locale = defaultLocale): AppMessages {
  return catalogs[locale as keyof typeof catalogs] ?? catalogs[defaultLocale];
}

export function getDateLocale(): string {
  return 'en-US';
}
`;
fs.writeFileSync(
  path.join(dest, "frontend/src/shared/i18n/messages.ts"),
  docsMessagesTs,
);

fs.writeFileSync(
  path.join(dest, "frontend/src/shared/i18n/config.ts"),
  `export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
`,
);
rmRel("frontend/src/shared/i18n/messages/mn.json");

const rootRedirect = `import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/docs');
}
`;
fs.writeFileSync(path.join(dest, "frontend/app/page.tsx"), rootRedirect);

fs.writeFileSync(
  path.join(dest, "frontend/src/processes/index.ts"),
  "export { DocsProviders } from './docs-providers';\n",
);

fs.writeFileSync(
  path.join(dest, "frontend/src/index.ts"),
  "export * from './processes';\n",
);
fs.writeFileSync(
  path.join(dest, "frontend/src/features/index.ts"),
  '/** Docs-only frontend — feature barrels are not used. */\nexport {};\n',
);
fs.writeFileSync(
  path.join(dest, "frontend/src/shared/index.ts"),
  "export * from './config';\nexport { cn } from './lib/utils';\n",
);
fs.writeFileSync(
  path.join(dest, "frontend/src/shared/lib/index.ts"),
  "export { cn } from './utils';\nexport * from './formatters';\n",
);

const globalsCssPath = path.join(dest, "frontend/app/globals.css");
const globalsCss = fs.readFileSync(globalsCssPath, "utf8");
fs.writeFileSync(
  globalsCssPath,
  globalsCss.replace(/^@import "\.\.\/src\/shared\/styles\/marketing\.css";\n/m, ""),
);

const nextConfigPath = path.join(dest, "frontend/next.config.ts");
const nextConfig = fs.readFileSync(nextConfigPath, "utf8");
fs.writeFileSync(
  nextConfigPath,
  nextConfig
    .replace(/^\s*'@default\/api',\n/m, "")
    .replace(/^\s*'@default\/hooks',\n/m, ""),
);
