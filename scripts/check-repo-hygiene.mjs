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
assertRepositoryUrl();
console.log("check-repo-hygiene: ok");
