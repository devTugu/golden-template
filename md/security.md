# Security

Template security notes — not a certification claim.

## Backend auth

| Mechanism | Details |
|-----------|---------|
| JWT access | `JWT_ACCESS_EXPIRES_IN` (default `15m`) |
| Refresh | Rotated; Redis blacklist on logout |
| Throttle / lockout | `LOGIN_THROTTLE_*`, `LOGIN_MAX_FAILED_ATTEMPTS` |
| Password | bcrypt; policy in shared types |

Secrets: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (min 32 chars), `MFA_ENCRYPTION_KEY`.

## MFA / OIDC

`MFA_ISSUER`, `MFA_REQUIRED_ROLES`, `OAUTH_*` when `OAUTH_ENABLED=true`.

## Authorization

Permission codes on admin routes (`PermissionsGuard`); Redis cache when enabled.

## BFF (frontend)

- httpOnly cookies for tokens — not `localStorage`
- `/api/backend/*` proxy with JWT from cookie
- CSRF on state-changing BFF routes (`GET /api/auth/csrf`)
- Path allowlist: `frontend/src/shared/config/bff-allowlist.ts`
- Dashboard guard: `frontend/src/processes/proxy.ts`

| Variable | Scope |
|----------|--------|
| `API_INTERNAL_URL` | Server only — required in prod |
| `NEXT_PUBLIC_*` | Display only — no secrets |

Client IP for upstream: `frontend/src/shared/lib/bff-client-meta.ts`.

## Dependencies

CI runs `pnpm audit --audit-level=high` and **fails** on high or critical advisories (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

### `pnpm.overrides` (root `package.json`)

| Package | Reason |
|---------|--------|
| `body-parser` `>=2.4.0` | `@nestjs/platform-express` still pulls `body-parser@2.3.x` until Nest ships a fixed express stack; override pins the patched release ([GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828)). Remove when `pnpm why body-parser` resolves to `>=2.4.0` without override. |
| `multer` `>=2.5.0` | Same for `@nestjs/platform-express` → `multer@2.4.x` ([GHSA-q7qp-rjg7-q26m](https://github.com/advisories/GHSA-q7qp-rjg7-q26m)). Remove when transitive version is patched upstream. |
| OpenTelemetry, `esbuild`, `vite`, etc. | Historical transitive fixes; re-check with `pnpm why <pkg>` before removing. |

### `auditConfig.ignoreGhsas`

| GHSAs | Reason |
|-------|--------|
| `GHSA-vfj7-8cjw-p6xm` | Moderate-only advisory in a dev/build toolchain path; not high/critical. Re-run `pnpm audit --json` after major upgrades; remove if the advisory no longer appears. |

## Operator (your infra)

TLS, WAF, backups, SIEM, key rotation, legal/privacy policy — outside this repo.
