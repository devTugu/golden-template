#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(root, 'packages/ui/src');

function listTsxFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) listTsxFiles(full, out);
    else if (ent.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

function ensureVariantsImport(content) {
  if (!content.includes('from "motion/react"')) return content;
  if (/import \{[^}]*\bVariants\b/.test(content)) return content;
  if (content.includes('import type { Variants }')) return content;
  return content.replace(
    /from "motion\/react";/,
    'from "motion/react";\nimport type { Variants } from "motion/react";',
  );
}

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('motion/react') && !content.includes('variants={')) {
    return false;
  }
  let next = content;
  next = next.replace(
    /variants=\{(\w+)\}/g,
    'variants={$1 as unknown as Variants}',
  );
  next = next.replace(
    /transition=\{\{\s*type: "spring"/g,
    'transition={{ type: "spring" as const',
  );
  if (next !== content) {
    next = ensureVariantsImport(next);
    fs.writeFileSync(file, next);
    return true;
  }
  return false;
}

let patched = 0;
for (const file of listTsxFiles(uiSrc)) {
  if (patchFile(file)) patched += 1;
}

console.log(`Patched ${patched} files for motion Variants casts.`);

try {
  execSync('pnpm exec tsc -p tsconfig.demos.json --noEmit', {
    cwd: path.join(root, 'packages/ui'),
    stdio: 'pipe',
  });
  console.log('tsconfig.demos.json: clean');
} catch (e) {
  const out = e.stdout?.toString() ?? '';
  const count = (out.match(/error TS/g) ?? []).length;
  console.log(`Remaining errors: ${count}`);
  fs.writeFileSync(path.join(root, '.ui-tsc-remaining.txt'), out);
}
