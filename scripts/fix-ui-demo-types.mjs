#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const uiSrc = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  'packages/ui/src',
);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

for (const file of walk(uiSrc)) {
  let text = fs.readFileSync(file, 'utf8');
  const next = text
    .replace(/ as Variants/g, ' as unknown as Variants')
    .replace(/type type Variants/g, 'type Variants')
    .replace(
      /transition=\{\{\s*type: "spring"/g,
      'transition={{ type: "spring" as const',
    );
  if (next !== text) fs.writeFileSync(file, next);
}
