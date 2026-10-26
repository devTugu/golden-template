#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -n "${GOLDEN_TEMPLATE_ROOT:-}" ]]; then
  ROOT="$(cd "$GOLDEN_TEMPLATE_ROOT" && pwd)"
elif [[ -f "$SCRIPT_DIR/../backend/package.json" ]] && [[ -d "$SCRIPT_DIR/../packages/ui" ]]; then
  ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  ROOT="$(cd "$SCRIPT_DIR/../../default" && pwd)"
fi
DEST="${1:-$SCRIPT_DIR/..}"

echo "Populating $DEST from $ROOT"
mkdir -p "$DEST/scripts" "$DEST/md"

for dir in packages/types packages/ui packages/design-tokens packages/ui-charts packages/ui-code packages/ui-motion-3d packages/utils packages/config/tsconfig packages/config/eslint-config; do
  rsync -a "$ROOT/$dir/" "$DEST/$dir/"
done

cp "$ROOT/scripts/populate-golden-template-ui-docs.sh" "$DEST/scripts/"
cp "$ROOT/scripts/finish-ui-docs-repo.mjs" "$DEST/scripts/"
if [[ -f "$DEST/scripts/sync-defaultspace-docs-batch.mjs" ]]; then
  :
elif [[ -f "$ROOT/scripts/sync-defaultspace-docs-batch.mjs" ]]; then
  cp "$ROOT/scripts/sync-defaultspace-docs-batch.mjs" "$DEST/scripts/"
fi
cp "$ROOT/scripts/sync-defaultspace-composed.mjs" "$DEST/scripts/" 2>/dev/null || true
cp "$ROOT/scripts/sync-ui-package-exports.mjs" "$DEST/scripts/"
cp "$ROOT/scripts/ui-import-inventory.mjs" "$DEST/scripts/"
cp "$ROOT/scripts/stamp-dist.mjs" "$DEST/scripts/"
cp "$ROOT/md/ui-inventory.md" "$DEST/md/"
cp "$ROOT/.gitignore" "$DEST/"

rsync -a "$ROOT/frontend/" "$DEST/frontend/"
rm -rf "$DEST/frontend/app/dashboard" "$DEST/frontend/app/(auth)" "$DEST/frontend/app/(marketing)" "$DEST/frontend/app/api"
rm -rf "$DEST/frontend/e2e"
rm -rf "$DEST/frontend/src/features/auth" "$DEST/frontend/src/features/users" "$DEST/frontend/src/features/roles"
rm -rf "$DEST/frontend/src/features/permissions" "$DEST/frontend/src/features/organizations"
rm -rf "$DEST/frontend/src/features/site-settings" "$DEST/frontend/src/features/mfa" "$DEST/frontend/src/features/audit-logs"
rm -rf "$DEST/frontend/src/widgets" "$DEST/frontend/src/entities"

node "$ROOT/scripts/finish-ui-docs-repo.mjs" "$DEST"

echo "Done. cd $DEST && pnpm install && pnpm dev"
