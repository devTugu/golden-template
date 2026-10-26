#!/usr/bin/env node
/** Regenerate composed/default-space export maps in packages/ui/package.json */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = path.join(root, 'packages/ui/package.json');
const uiSrc = path.join(root, 'packages/ui/src');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const layerExports = {};

function walk(dir, layer, rel = '') {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, layer, relPath);
      continue;
    }
    if (ent.name === 'index.ts' || ent.name === 'index.tsx') {
      const dirKey = `./${layer}/${relPath.replace(/\/index\.tsx?$/, '')}`;
      const indexKey = `./${layer}/${relPath.replace(/\.tsx?$/, '')}`;
      layerExports[dirKey] = `./src/${layer}/${relPath}`;
      layerExports[indexKey] = `./src/${layer}/${relPath}`;
    }
    if (ent.name.endsWith('.tsx') && !ent.name.startsWith('index.')) {
      const key = `./${layer}/${relPath.replace(/\.tsx$/, '')}`;
      layerExports[key] = `./src/${layer}/${relPath}`;
    }
    if (ent.name.endsWith('.css')) {
      const key = `./${layer}/${relPath.replace(/\.css$/, '')}.css`;
      layerExports[key] = `./src/${layer}/${relPath}`;
    }
  }
}

for (const layer of ['composed', 'default-space']) {
  const dir = path.join(uiSrc, layer);
  if (fs.existsSync(dir)) walk(dir, layer);
}

const preserved = {};
for (const [k, v] of Object.entries(pkg.exports)) {
  if (!k.startsWith('./composed/') && !k.startsWith('./default-space/')) {
    preserved[k] = v;
  }
}

pkg.exports = {
  ...preserved,
  ...Object.fromEntries(
    Object.entries(layerExports).sort(([a], [b]) => a.localeCompare(b)),
  ),
};
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(
  `Updated exports: ${Object.keys(layerExports).length} composed/default-space entries.`,
);
