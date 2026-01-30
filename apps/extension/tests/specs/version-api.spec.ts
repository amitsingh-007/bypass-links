import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';

test('should call extension.latest API and return expected response structure', async ({
  page,
  extensionId,
  login: _login,
}) => {
  const apiPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/trpc/extension.latest') &&
      response.status() === 200,
    { timeout: TEST_TIMEOUTS.PAGE_OPEN }
  );

  await page.goto(`chrome-extension://${extensionId}/index.html`);
  const apiResponse = await apiPromise;

  const responseJson = await apiResponse.json();
  const responseData = responseJson[0]?.result?.data;

  expect(responseData).toBeDefined();
  expect(responseData.chrome).toBeTruthy();

  const { chrome: chromeData } = responseData;
  expect(chromeData.version).toBeTruthy();
  expect(chromeData.downloadLink).toBeTruthy();
  expect(chromeData.date).toBeTruthy();
});
