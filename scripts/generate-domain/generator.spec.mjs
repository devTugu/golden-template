import assert from "node:assert/strict";
import test from "node:test";
import { parseGeneratorArgs } from "./parse-args.mjs";

test("parseGeneratorArgs defaults tier to simple", () => {
  const args = parseGeneratorArgs(["node", "script", "--name", "foo-bar"]);
  assert.equal(args.name, "foo-bar");
  assert.equal(args.tier, "simple");
  assert.equal(args.dryRun, false);
});

test("parseGeneratorArgs honors domain tier and dry-run", () => {
  const args = parseGeneratorArgs([
    "node",
    "script",
    "--name",
    "x",
    "--tier",
    "domain",
    "--dry-run",
  ]);
  assert.equal(args.tier, "domain");
  assert.equal(args.dryRun, true);
});
