import { RedirectionSchema, RedirectionsSchema } from '@bypass/shared/schema';
import { TEST_SHORTCUTS } from '@bypass/shared/tests';
import { z } from 'zod/mini';

import { test, expect } from '../fixtures/auth-fixture';

test('should call extension.latest API and return expected response structure', async ({
  page,
  extensionId,
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

test('returns plain shortcuts and preserves the legacy read wire format', async ({
  page,
  extensionId,
}) => {
  const authenticatedRequest = page.waitForRequest((request) =>
    request.url().includes('/api/trpc/extension.latest')
  );
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  const request = await authenticatedRequest;
  const authorization = request.headers().authorization;
  expect(authorization).toMatch(/^Bearer /);
  const url = new URL(
    '/api/trpc/firebaseData.redirectionsList,firebaseData.redirectionsGet?batch=1&input=%7B%7D',
    request.url()
  );
  const response = await page.request.get(url.href, {
    headers: { authorization },
  });
  expect(response.ok()).toBe(true);
  const [plain, legacy] = z
    .array(z.object({ result: z.object({ data: RedirectionsSchema }) }))
    .parse(await response.json())
    .map(({ result }) => result.data);
  expect(plain.map(({ id }) => id)).toEqual(legacy.map(({ id }) => id));
  const google = RedirectionSchema.parse(
    plain.find(({ alias }) => alias === TEST_SHORTCUTS.GOOGLE)
  );
  expect(legacy.find(({ id }) => id === google.id)).toEqual({
    ...google,
    alias: btoa(google.alias),
    website: btoa(google.website),
  });
});
