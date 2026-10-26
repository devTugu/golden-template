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

test("workspace package.json repository urls align", () => {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const rootUrl = rootPkg.repository.url;
  for (const rel of ["backend/package.json", "frontend/package.json"]) {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
    assert.equal(pkg.repository.url, rootUrl);
    assert.equal(pkg.version, rootPkg.version);
    assert.equal(pkg.private, true);
  }
});
