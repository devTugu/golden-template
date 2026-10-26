export type SwitchOrganizationFetcher = (
  organizationId: number,
) => Promise<{ expiresIn: number }>;

let switchOrganizationFetcher: SwitchOrganizationFetcher | null = null;

export function configureSwitchOrganizationFetcher(
  fetcher: SwitchOrganizationFetcher,
): void {
  switchOrganizationFetcher = fetcher;
}

export function getSwitchOrganizationFetcher(): SwitchOrganizationFetcher {
  if (!switchOrganizationFetcher) {
    throw new Error(
      "@default/hooks: call configureSwitchOrganizationFetcher() before useSwitchOrganization (wire in frontend)",
    );
  }
  return switchOrganizationFetcher;
}
