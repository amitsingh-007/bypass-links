import type { Page } from '@playwright/test';

/**
 * Search browser history for items matching specific URLs
 */
export const getHistoryItems = async (
  page: Page,
  urls?: string[]
): Promise<chrome.history.HistoryItem[]> => {
  return page.evaluate(async (urlsToCheck) => {
    return new Promise<chrome.history.HistoryItem[]>((resolve) => {
      chrome.history.search(
        {
          text: '',
          maxResults: 1000,
          startTime: 0,
        },
        (results) => {
          if (urlsToCheck) {
            const filtered = results.filter((item) =>
              urlsToCheck.some((url) => item.url?.includes(url))
            );
            resolve(filtered);
          } else {
            resolve(results);
          }
        }
      );
    });
  }, urls);
};
