#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`check-repo-hygiene: ${message}`);
  process.exit(1);
}

function trackedFiles() {
  const out = execSync("git ls-files", { cwd: root, encoding: "utf8" });
  return out.split("\n").filter(Boolean);
}

function assertNoTrackedNodeModules(files) {
  const bad = files.filter((f) => f.includes("node_modules/"));
  if (bad.length > 0) {
    fail(`tracked node_modules paths:\n${bad.slice(0, 10).join("\n")}`);
  }
}

function assertEnvExamples() {
  for (const rel of ["backend/.env.example", "frontend/.env.example"]) {
    if (!fs.existsSync(path.join(root, rel))) {
      fail(`missing ${rel}`);
    }
  }
}

function walkTsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === "dist" || ent.name === ".next") {
      continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx)$/.test(ent.name)) out.push(full);
  }
  return out;
}

function assertNoTsNocheck() {
  const dirs = ["backend/src", "frontend", "packages", "scripts"];
  for (const rel of dirs) {
    for (const file of walkTsFiles(path.join(root, rel))) {
      const text = fs.readFileSync(file, "utf8");
      if (text.includes("@ts-nocheck")) {
        fail(`@ts-nocheck found in ${path.relative(root, file)}`);
      }
    }
  }
}

const DEFAULT_PASSWORD_ALLOW = new Set([
  "backend/.env.example",
  "frontend/.env.example",
  "md/deploy.md",
  "md/security.md",
  "README.md",
]);

const PASSWORD_ALLOW_PREFIXES = [
  "backend/src/infrastructure/database/seed/",
  "frontend/e2e/",
  "backend/test/",
];

function assertNoDefaultPasswordsInCode(files) {
  const needles = ["admin123!", "viewer123!"];
  for (const rel of files) {
    if (rel === "scripts/check-repo-hygiene.mjs") continue;
    if (!/\.(ts|tsx|js|mjs)$/.test(rel)) continue;
    if (rel.includes(".spec.") || rel.includes("e2e/")) continue;
    if (PASSWORD_ALLOW_PREFIXES.some((p) => rel.startsWith(p))) continue;
    if ([...DEFAULT_PASSWORD_ALLOW].some((p) => rel.endsWith(p) || rel.includes(p))) {
      continue;
    }
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    for (const needle of needles) {
      if (text.includes(needle)) {
        fail(`found ${needle} in ${rel}`);
      }
    }
  }
}

function normalizeGitUrl(url) {
  const trimmed = url.trim().replace(/\.git$/, "");
  const ssh = trimmed.match(/^git@github\.com:(.+)$/);
  if (ssh) return `https://github.com/${ssh[1]}`;
  return trimmed;
}

const WORKSPACE_PACKAGE_JSON = [
  "package.json",
  "backend/package.json",
  "frontend/package.json",
  "packages/types/package.json",
  "packages/utils/package.json",
  "packages/api/package.json",
  "packages/hooks/package.json",
  "packages/ui/package.json",
  "packages/design-tokens/package.json",
  "packages/config/tsconfig/package.json",
  "packages/config/eslint-config/package.json",
];

function assertNoForbiddenDeps() {
  for (const rel of WORKSPACE_PACKAGE_JSON) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue;
    const pkg = JSON.parse(fs.readFileSync(full, "utf8"));
    const names = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ];
    for (const banned of ["joi", "class-validator"]) {
      if (names.includes(banned)) {
        fail(`${rel} must not depend on ${banned}`);
      }
    }
  }
}

function assertNoBackendHelmPaths(files) {
  const bad = files.filter((f) => f.startsWith("backend/deploy/helm/"));
  if (bad.length > 0) {
    fail(`Helm charts belong under deploy/advanced/helm, not backend:\n${bad.join("\n")}`);
  }
}

function assertSingleTenantSchema() {
  const schemaPath = path.join(
    root,
    "backend/src/infrastructure/database/drizzle/schema/index.ts",
  );
  if (!fs.existsSync(schemaPath)) {
    fail("missing Drizzle schema index.ts");
  }
  const text = fs.readFileSync(schemaPath, "utf8");
  if (/\borganization_id\b/.test(text) || /\borganizations\b/.test(text)) {
    fail(
      "Drizzle schema must not define organizations or organization_id (single-tenant template)",
    );
  }
}

function assertRepositoryUrl() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const expected = execSync("git remote get-url origin", {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const declared = normalizeGitUrl(pkg.repository?.url ?? "");
  const normalizedExpected = normalizeGitUrl(expected);
  if (declared !== normalizedExpected) {
    fail(`package.json repository.url (${declared}) != origin (${normalizedExpected})`);
  }
}

const files = trackedFiles();
assertNoTrackedNodeModules(files);
assertEnvExamples();
assertNoTsNocheck();
assertNoDefaultPasswordsInCode(files);
assertNoForbiddenDeps();
assertNoBackendHelmPaths(files);
assertSingleTenantSchema();
assertRepositoryUrl();
console.log("check-repo-hygiene: ok");
