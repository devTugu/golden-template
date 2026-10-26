export function parseGeneratorArgs(argv) {
  const nameIdx = argv.indexOf("--name");
  const name =
    nameIdx === -1 || !argv[nameIdx + 1]
      ? null
      : argv[nameIdx + 1].trim().toLowerCase();

  const tierIdx = argv.indexOf("--tier");
  const tierRaw = tierIdx === -1 ? "simple" : argv[tierIdx + 1];
  const tier = tierRaw === "domain" ? "domain" : "simple";

  const dryRun = argv.includes("--dry-run");

  return { name, tier, dryRun };
}

export function assertKebab(name) {
  if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    console.error(
      'Usage: pnpm generate:domain -- --name <kebab-case> [--tier simple|domain] [--dry-run]',
    );
    process.exit(1);
  }
}
