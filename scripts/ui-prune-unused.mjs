#!/usr/bin/env node
/**
 * Delete composed/default-space demo files not reachable from app/docs/packages
 * or from kept composed re-export shims.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(root, 'packages/ui/src');

const SCAN_DIRS = [
  path.join(root, 'frontend/app'),
  path.join(root, 'frontend/src'),
  path.join(root, 'packages/api'),
  path.join(root, 'packages/hooks'),
  path.join(root, 'packages/types'),
  path.join(root, 'packages/utils'),
  path.join(root, 'packages/ui-charts'),
  path.join(root, 'packages/ui-code'),
  path.join(root, 'packages/ui-motion-3d'),
];

const PKG_IMPORT_RE =
  /@default\/ui\/(composed|default-space)\/([a-z0-9-]+(?:\/[a-z0-9.-]+)*)/gi;
const REL_IMPORT_RE =
  /from\s+["'](\.\.?\/[^"']+)["']/g;

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') continue;
      walkFiles(full, out);
    } else if (/\.(tsx?|jsx?|mjs|css)$/.test(ent.name)) {
      out.push(full);
    }
  }
  return out;
}

function listModuleFiles(layer) {
  const dir = path.join(uiSrc, layer);
  const files = [];
  if (!fs.existsSync(dir)) return files;
  walkFiles(dir, files);
  return files.filter(
    (f) => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css'),
  );
}

function toModuleKey(absPath) {
  const rel = path.relative(uiSrc, absPath).replace(/\\/g, '/');
  return rel.replace(/\.tsx?$/, '');
}

function resolveRelativeImport(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && c.startsWith(uiSrc)) {
      return toModuleKey(c);
    }
  }
  return null;
}

function collectExternalUsed() {
  const used = new Set();
  for (const base of SCAN_DIRS) {
    for (const file of walkFiles(base)) {
      const text = fs.readFileSync(file, 'utf8');
      let m;
      PKG_IMPORT_RE.lastIndex = 0;
      while ((m = PKG_IMPORT_RE.exec(text)) !== null) {
        used.add(`${m[1]}/${m[2].replace(/\/index$/, '')}`);
      }
    }
  }
  return used;
}

function normalizeImportPath(p) {
  return p.replace(/\/index$/, '');
}

function expandUsedClosure(initial) {
  const usedKeys = new Set();
  for (const u of initial) {
    usedKeys.add(normalizeImportPath(u));
  }

  const allUiFiles = [
    ...listModuleFiles('composed'),
    ...listModuleFiles('default-space'),
    ...walkFiles(path.join(uiSrc, 'default-space')),
  ];

  const byKey = new Map();
  for (const f of allUiFiles) {
    byKey.set(toModuleKey(f), f);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const key of [...usedKeys]) {
      const file = byKey.get(key);
      if (!file || !fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, 'utf8');
      let m;
      REL_IMPORT_RE.lastIndex = 0;
      while ((m = REL_IMPORT_RE.exec(text)) !== null) {
        const resolved = resolveRelativeImport(file, m[1]);
        if (resolved && !usedKeys.has(resolved)) {
          usedKeys.add(resolved);
          changed = true;
        }
      }
      PKG_IMPORT_RE.lastIndex = 0;
      while ((m = PKG_IMPORT_RE.exec(text)) !== null) {
        const inner = normalizeImportPath(`${m[1]}/${m[2]}`);
        if (!usedKeys.has(inner)) {
          usedKeys.add(inner);
          changed = true;
        }
      }
    }
  }
  return { usedKeys, byKey };
}

function stripIndex(key) {
  return key.replace(/\/index$/, '');
}

function keyMatchesUsed(key, usedKeys) {
  const keyBase = stripIndex(key);
  for (const u of usedKeys) {
    const uBase = stripIndex(u);
    if (
      key === u ||
      keyBase === uBase ||
      key.startsWith(`${u}/`) ||
      key.startsWith(`${uBase}/`) ||
      u.startsWith(`${key}/`) ||
      u.startsWith(`${keyBase}/`)
    ) {
      return true;
    }
  }
  return false;
}

function main() {
  const external = collectExternalUsed();
  const { usedKeys, byKey } = expandUsedClosure(external);

  let deleted = 0;
  for (const [key, file] of byKey) {
    if (!key.startsWith('composed/') && !key.startsWith('default-space/')) {
      continue;
    }
    if (keyMatchesUsed(key, usedKeys)) continue;
    fs.unlinkSync(file);
    deleted += 1;
  }

  for (const layer of ['composed', 'default-space']) {
    const layerDir = path.join(uiSrc, layer);
    if (!fs.existsSync(layerDir)) continue;
    for (const cat of fs.readdirSync(layerDir, { withFileTypes: true })) {
      if (!cat.isDirectory()) continue;
      const catDir = path.join(layerDir, cat.name);
      pruneEmptyDirs(catDir);
      if (fs.existsSync(catDir) && fs.readdirSync(catDir).length === 0) {
        fs.rmdirSync(catDir);
      }
    }
  }

  console.log(`Deleted ${deleted} unused module files.`);
  console.log(`Kept ${usedKeys.size} reachable module keys from ${external.size} external entry points.`);
}

function pruneEmptyDirs(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      const sub = path.join(dir, ent.name);
      pruneEmptyDirs(sub);
      if (fs.readdirSync(sub).length === 0) fs.rmdirSync(sub);
    }
  }
}

main();
