import { test, expect } from '../fixtures/auth-fixture';

test('should be logged in with firebase token', async ({
  page,
  extensionId,
  login,
}) => {
  const extUrl = `chrome-extension://${extensionId}/index.html`;
  await page.goto(extUrl);
  await page.waitForLoadState('networkidle');

  const loginButton = page.getByRole('button', { name: 'Login' });
  await expect(loginButton).toBeVisible({ timeout: 10_000 });
  await loginButton.click({ force: true });

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: 30_000 });

  const fbOAuthData = await page.evaluate(() =>
    window.localStorage.getItem('__fbOAuth')
  );
  expect(fbOAuthData).toBeTruthy();
  const parsed = JSON.parse(fbOAuthData!);
  expect(parsed.state.idpAuth.email).toBeTruthy();
});
