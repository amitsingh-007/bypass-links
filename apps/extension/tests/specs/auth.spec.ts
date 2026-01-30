import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';

test.skip('should be logged in with firebase token', async ({
  page,
  extensionId,
  login: _login,
}) => {
  const extUrl = `chrome-extension://${extensionId}/index.html`;
  await page.goto(extUrl);
  await page.waitForLoadState('networkidle');

  const loginButton = page.getByTestId('login-button');
  await expect(loginButton).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });
  await loginButton.click({ force: true });

  const logoutButton = page.getByTestId('logout-button');
  await expect(logoutButton).toBeVisible({ timeout: TEST_TIMEOUTS.AUTH });

  const fbOAuthData = await page.evaluate(() =>
    window.localStorage.getItem('__fbOAuth')
  );
  expect(fbOAuthData).toBeTruthy();
  const parsed = JSON.parse(fbOAuthData!);
  expect(parsed.state.idpAuth.email).toBeTruthy();
});
