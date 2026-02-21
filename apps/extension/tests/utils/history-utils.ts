import type { Page } from '@playwright/test';

/**
 * Search browser history for items matching specific URLs
 */
export const getHistoryItems = async (page: Page, urls?: string[]) => {
  return page.evaluate(async (urlsToCheck) => {
    const results = await browser.history.search({
      text: '',
      maxResults: 1000,
      startTime: 0,
    });
    if (!urlsToCheck) {
      return results;
    }
    return results.filter((item) =>
      urlsToCheck.some((url) => item.url?.includes(url))
    );
  }, urls);
};
