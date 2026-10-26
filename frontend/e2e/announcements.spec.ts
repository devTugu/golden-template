import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsViewer } from './helpers/auth';
import { ROUTES } from '../src/shared/config/routes';

test.describe('Announcements admin', () => {
  test('admin can open announcements page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(ROUTES.ANNOUNCEMENTS);
    await expect(page.getByRole('heading', { name: /announcements|зарлал/i })).toBeVisible();
  });

  test('viewer without permission sees access denied', async ({ page }) => {
    await loginAsViewer(page);
    await page.goto(ROUTES.ANNOUNCEMENTS);
    await expect(page.getByText(/access denied|хандах эрх/i)).toBeVisible();
  });
});
