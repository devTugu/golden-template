import { test, expect } from '@playwright/test';
import { fetchCsrf, adminEmail } from './helpers/auth';

const apiBase = process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1';

test.describe('Password recovery', () => {
  test('forgot password captures reset URL for e2e', async ({ page }) => {
    const csrf = await fetchCsrf(page);
    const forgot = await page.request.post('/api/auth/password/forgot', {
      headers: { 'x-csrf-token': csrf },
      data: { email: adminEmail },
    });
    expect(forgot.status()).toBe(204);

    const captured = await page.request.get(`${apiBase}/dev/notifications/reset`);
    expect(captured.ok()).toBeTruthy();
    const json = (await captured.json()) as { resetUrl?: string | null };
    expect(json.resetUrl).toMatch(/\/reset-password\?token=/);
  });
});
