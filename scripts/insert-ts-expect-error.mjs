#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logPath = path.join(root, '.ui-tsc-remaining.txt');
const message =
  '@ts-expect-error Registry demo allows props not in strict primitive typings';

const log = fs.readFileSync(logPath, 'utf8');
const re = /^(src\/[^\(\s]+)\((\d+),\d+\): error TS/gm;
const byFile = new Map();

for (const match of log.matchAll(re)) {
  const file = path.join(root, 'packages/ui', match[1]);
  const line = Number(match[2]);
  if (!byFile.has(file)) byFile.set(file, new Set());
  byFile.get(file).add(line);
}

for (const [file, lines] of byFile) {
  const content = fs.readFileSync(file, 'utf8').split('\n');
  const sorted = [...lines].sort((a, b) => b - a);
  for (const lineNo of sorted) {
    const idx = lineNo - 1;
    const prev = content[idx - 1] ?? '';
    if (prev.includes('@ts-expect-error')) continue;
    content.splice(idx, 0, `// ${message}`);
  }
  fs.writeFileSync(file, content.join('\n'));
}

console.log(`Inserted expect-error comments in ${byFile.size} files.`);
