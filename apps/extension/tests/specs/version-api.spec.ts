import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';

test('should call extension.latest API and return expected response structure', async ({
  page,
  extensionId,
}) => {
  const apiPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/trpc/extension.latest') &&
      response.status() === 200,
    { timeout: TEST_TIMEOUTS.PAGE_OPEN }
  );

  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  const apiResponse = await apiPromise;

  const responseJson = await apiResponse.json();
  const responseData = responseJson[0]?.result?.data;

  expect(responseData).toBeDefined();
  expect(responseData.chrome).toBeDefined();
  expect(typeof responseData.chrome).toBe('object');

  const { chrome: chromeData } = responseData;

  // Validate semantic version format (e.g., "1.2.3")
  expect(chromeData.version).toMatch(/^\d+\.\d+\.\d+$/);

  // Validate URL format for download link
  expect(chromeData.downloadLink).toMatch(/^https?:\/\/.+/);

  // Validate ISO date format (e.g., "2024-01-15" or "2024-01-15T10:30:00Z")
  expect(chromeData.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
});
