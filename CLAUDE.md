# Golden Template — Claude instructions

Full-stack auth/admin starter (pnpm workspace). Overview: `README.md`. Product & fork docs: `md/README.md`.

Single source of truth for coding rules is `.cursor/rules/` — shared with Cursor. Edit rules there, not here.

## Always-on rules

@.cursor/rules/project-core.mdc
@.cursor/rules/clean-code.mdc
@.cursor/rules/reuse-utils.mdc
@.cursor/rules/shared-schemas.mdc
@.cursor/rules/agent-workflow.mdc

## Scoped rules — read before editing matching files

| Files | Rule |
|-------|------|
| `backend/**` | `.cursor/rules/clean-architecture.mdc` |
| `backend/src/infrastructure/database/**`, tenancy-sensitive backend | `.cursor/rules/tenancy.mdc` |
| Auth reset/invite backend, BFF, types | `.cursor/rules/auth-tokens.mdc` |
| `scripts/generate-domain/**`, `backend/src/modules/**` | `.cursor/rules/module-generator.mdc` |
| `frontend/**` | `.cursor/rules/frontend-data.mdc` |
| `frontend/**`, `packages/ui/**`, `packages/design-tokens/**` | `.cursor/rules/design-system.mdc` |
| `frontend/e2e/**`, `frontend/playwright.config.ts` | `.cursor/rules/playwright-e2e.mdc` |
| `**/package.json`, lockfile, `.github/**` | `.cursor/rules/dependencies-security.mdc` |
| Backend config/seed, `.env.example`, deploy | `.cursor/rules/production-safety.mdc` |
| `**/*.{ts,tsx}` | `.cursor/rules/typescript-strictness.mdc` |
| README, `md/`, gitignore, scripts | `.cursor/rules/docs-and-repo-hygiene.mdc` |

## Commands

```bash
pnpm dev:backend | dev:frontend
pnpm lint
pnpm test
pnpm test:e2e:frontend
pnpm --filter @default/design-tokens generate
pnpm verify
pnpm check:hygiene
```

Run lint + tests for the touched package before reporting work as done; cross-cutting changes → `pnpm verify`.
