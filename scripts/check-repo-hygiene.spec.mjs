import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("required env examples exist", () => {
  assert.ok(fs.existsSync(path.join(root, "backend/.env.example")));
  assert.ok(fs.existsSync(path.join(root, "frontend/.env.example")));
});

test("package repository points at golden-template", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.match(pkg.repository.url, /golden-template/);
});
