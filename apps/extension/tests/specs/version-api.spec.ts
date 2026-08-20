import { test, expect } from '../fixtures/auth-fixture';

test('should call extension.latest API and return expected response structure', async ({
  page,
  extensionId,
  login: _login,
}) => {
  const apiPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/trpc/extension.latest') &&
      response.status() === 200
  );

  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  const apiResponse = await apiPromise;

  const responseJson = await apiResponse.json();
  const responseData = responseJson[0]?.result?.data;

  expect(responseData).toBeDefined();
  expect(responseData.chrome).toBeDefined();
  expect(typeof responseData.chrome).toBe('object');

  const { chrome: chromeData } = responseData;

  expect(chromeData.version).toMatch(/^\d+\.\d+\.\d+$/);

  expect(chromeData.downloadLink).toMatch(/^https?:\/\/.+/);

  expect(chromeData.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
});
