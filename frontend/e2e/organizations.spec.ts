import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { goToSidebarLink } from './helpers/dashboard-nav';

test.describe('Organizations admin', () => {
  test('admin can open organizations page', async ({ page }) => {
    await loginAsAdmin(page);
    await goToSidebarLink(
      page,
      'Organizations',
      /\/dashboard\/organizations/,
    );
    await expect(page.getByRole('button', { name: /Add organization|Байгууллага нэмэх/i })).toBeVisible();
  });
});
