# Changelog

## [2.0.0] — 2026-10-26

### Breaking

- **Single-tenant schema:** Removed `organizations`, `organization_members`, and all `organization_id` columns. Run database migrations (`pnpm --filter backend run migration:run`) on every environment before deploying API code from this release.
- Removed `ORGANIZATION_DEFAULT_SLUG` from backend environment validation.

### Added

- [`md/tenancy.md`](md/tenancy.md) — single-tenant stance and guide for adding tenancy later.
- **Simple-tier module** example: `announcements` (`backend/src/modules/announcements/`) with shared types, API, hooks, and admin UI.
- **Auth tokens:** password reset and user invite flows (`auth_tokens` table, Nest endpoints, `@default/types/auth` extensions).
- Two-tier domain generator (`--tier simple|domain`) and architecture ESLint import guards.
- Backend environment validation migrated from Joi to **Zod** (`validateEnv`).

### Changed

- Helm charts moved to [`deploy/advanced/helm/`](deploy/advanced/helm/); default CI no longer runs Helm-only jobs.
- Upload limit `MEDIA_MAX_BYTES` (env + BFF 413 handling).
- Removed `packages/ui-motion-3d` and docs-only motion demos from the default UI catalog.

### Upgrade notes

1. Run migrations through `0005_auth_tokens.sql` before starting API 2.x.
2. Drop org tables via `0003_remove_organizations.sql` on existing DBs (breaking).
3. Re-copy `.env.example` — org slug removed; optional `PASSWORD_RESET_TTL_MINUTES`, `INVITE_TTL_HOURS`, `MEDIA_MAX_BYTES`.
4. Optional: remove forked `announcements` module if unused (see `md/fork.md`).

## [1.3.0] — 2026-10-26

### Security

- Upgrade `next` and `zod`; document and apply `pnpm.overrides` for patched `body-parser` and `multer`.
- Production env validation rejects `change_me` secrets, requires `MFA_ENCRYPTION_KEY`, and distinct JWT secrets.
- Production database seed requires explicit admin credentials; no default passwords or e2e viewer user.

### Changed

- Product metadata and docs use **Golden Template** and `devTugu/golden-template` URLs.
- Add [`frontend/.env.example`](frontend/.env.example); backend `lint` is read-only (`lint:fix` for autofix).
- Stop tracking nested `node_modules`; align `md/security.md` with CI audit behavior.

## [1.2.0] — 2026-10-21

### Added

- `pnpm verify` — local parity with CI quality job (tokens, lint, typecheck, build, test, cov, audit)
- `@default/api` contract test (`parseWith`)
- Fork readiness checklist + example product table in `md/fork.md`

### Changed

- `pnpm quality` aliases `verify`
- Root `test` includes `@default/api`

## [1.1.0] — 2026-03-24

### Added

- Golden template tooling: `pnpm generate:domain` (Drizzle + repository + admin route), `pnpm fork:check`, `pnpm fork:rename-scope`
- Consolidated docs under `md/` (fork, deploy, quality)
- CI: required `pnpm audit --audit-level=high`
- Root `pnpm quality` script aligned with local pre-merge gates

### Changed

- Homepage hero i18n; BFF client IP; Vitest 5; eslint-plugin-boundaries v7

### Fixed

- Backend typecheck without pre-built `@default/utils` dist
- Jest workspace package resolution

## [1.0.0] — baseline

Auth/RBAC/admin/marketing platform skeleton — see [md/fork.md](md/fork.md).
