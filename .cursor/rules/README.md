# Cursor rules

Single source of truth for agents and humans. Wired in [`CLAUDE.md`](../../CLAUDE.md) (always-on vs scoped).

## Always apply

| Rule | Focus |
|------|--------|
| [project-core.mdc](project-core.mdc) | Monorepo layout, data flow, naming |
| [clean-code.mdc](clean-code.mdc) | Size limits, style, naming |
| [reuse-utils.mdc](reuse-utils.mdc) | Search `@default/*` before new helpers |
| [shared-schemas.mdc](shared-schemas.mdc) | One Zod schema per domain in `@default/types` |
| [agent-workflow.mdc](agent-workflow.mdc) | Definition of done, no silencing checks |

## Scoped (read before editing matching paths)

| Rule | Globs / paths |
|------|----------------|
| [clean-architecture.mdc](clean-architecture.mdc) | `backend/**` |
| [tenancy.mdc](tenancy.mdc) | DB schema, domain/application (single-tenant guard) |
| [auth-tokens.mdc](auth-tokens.mdc) | Reset/invite flows (backend, types, BFF, auth UI) |
| [module-generator.mdc](module-generator.mdc) | `scripts/generate-domain/**`, `backend/src/modules/**` |
| [frontend-data.mdc](frontend-data.mdc) | `frontend/**` |
| [design-system.mdc](design-system.mdc) | `frontend/**`, `packages/ui/**`, `packages/design-tokens/**` |
| [playwright-e2e.mdc](playwright-e2e.mdc) | `frontend/e2e/**`, `frontend/playwright.config.ts` |
| [dependencies-security.mdc](dependencies-security.mdc) | `package.json`, lockfile, `.github/**` |
| [production-safety.mdc](production-safety.mdc) | Backend env/seed, `.env.example`, deploy docs |
| [typescript-strictness.mdc](typescript-strictness.mdc) | `**/*.{ts,tsx}` |
| [docs-and-repo-hygiene.mdc](docs-and-repo-hygiene.mdc) | README, `md/`, gitignore, scripts |

Repo gate: `pnpm check:hygiene` (also in `pnpm verify` and CI).

Intentionally **not** included (unlike larger product repos): URL-state-only rules, SEO, MR review, mobile, Redis/Bull — add here only when this template grows those surfaces.
