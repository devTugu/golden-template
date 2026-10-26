import type { NavigationSection } from '@default/ui/default-space/blocks/hero-16/index';
import { PUBLIC_ROUTES, ROUTES } from '@/shared/config/routes';

type HomeHeroNavLabels = {
  privacy: string;
  terms: string;
  docs: string;
};

type BuildHomeHeroNavInput = {
  labels: HomeHeroNavLabels;
  /** External UI catalog URL (e.g. golden-template-ui-docs on :3002). */
  uiDocsUrl?: string;
};

export function buildHomeHeroNavigation({
  labels,
  uiDocsUrl,
}: BuildHomeHeroNavInput): NavigationSection[] {
  const items: NavigationSection[] = [
    { name: labels.privacy, href: PUBLIC_ROUTES.PRIVACY },
    { name: labels.terms, href: PUBLIC_ROUTES.TERMS },
  ];

  if (uiDocsUrl) {
    items.push({ name: labels.docs, href: uiDocsUrl });
  }

  return items;
}

export function homeHeroBookDemoHref(): string {
  return ROUTES.LOGIN;
}
