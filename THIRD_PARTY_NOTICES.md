# Third-party notices

This template vendors UI from public registries. Verify licenses before redistribution.

| Source | URL | License | Used in |
|--------|-----|---------|---------|
| shadcn/ui | https://github.com/shadcn-ui/ui | MIT | `packages/ui/src/primitives/*` via `scripts/fetch-default-primitives.mjs` and `packages/ui/components.json` |
| shadcn/ui (frontend CLI config) | https://ui.shadcn.com | MIT | `frontend/components.json` |
| shadcnspace / registry blocks | https://shadcnspace.com (registry JSON consumed by sync scripts) | **Verify per block** — not uniformly MIT in upstream; review before commercial use | `packages/ui/src/composed/*`, `packages/ui/src/default-space/*` via `scripts/sync-defaultspace-composed.mjs` |
| Lucide icons | https://github.com/lucide-icons/lucide | ISC | Icons across `@default/ui` |
| Motion | https://motion.dev | MIT | Animations in composed/default-space demos |
| shiki | https://github.com/shikijs/shiki | MIT | `packages/ui/src/lib/code-block.tsx` |

Maintenance scripts (inventory, prune, export sync) live under `scripts/` and are first-party.
