# Tenancy

Golden Template is **single-tenant by design**. One deployment serves one logical customer: one user directory, one site-settings row, one audit trail. There is no organization switcher and no org-scoped queries in the API.

## What was removed

Earlier schema versions included `organizations`, `organization_members`, and optional `organization_id` columns used only to tag rows on write. Reads were never scoped by organization, so the layer was misleading. Migration `0003_remove_organizations` drops those tables and columns.

## Adding multi-tenancy later

If you need true isolation between customers on shared infrastructure:

1. **Model** — Introduce an `organizations` (or `tenants`) table and `organization_id NOT NULL` on every tenant-owned table (users, roles if per-tenant, site_settings, audit_logs, and your product tables). Keep global reference data (e.g. permission codes) only if it is identical across tenants.
2. **Context** — Resolve the active org from the authenticated principal (e.g. JWT `orgId` from membership), request-scoped in Nest. Never rely on a static default slug in request paths.
3. **Queries** — One helper (e.g. `scopedWhere(table, orgId, …)`) and mandatory org id in repository methods. Add grep or unit tests that fail when a tenant-owned query omits the scope.
4. **Tests** — Cross-tenant leak tests for every repository and HTTP e2e with two orgs: foreign rows must 404 or return empty; audit must not leak.
5. **Product** — Multi-org admin UI, billing, and invite flows are separate product work; the template does not include them.

Until you implement the above, treat the app as single-tenant only.
