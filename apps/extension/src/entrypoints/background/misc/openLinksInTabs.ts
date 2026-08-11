import { sleep } from '@bypass/shared';

import { startHistoryWatch } from '@/utils/history';

const TAB_OPEN_DELAY_MS = 1000;

let pendingBatch = Promise.resolve();

const openBatch = async (urls: string[]) => {
  await startHistoryWatch();

  /* oxlint-disable no-await-in-loop */
  for (const [index, url] of urls.entries()) {
    if (index > 0) {
      // Paced deliberately: forums rate-limit rapid opens
      await sleep(TAB_OPEN_DELAY_MS);
    }
    try {
      await browser.tabs.create({ url, active: false });
    } catch (error) {
      console.error('Failed to open forum link', url, error);
    }
  }
  /* oxlint-enable no-await-in-loop */
};

// Batches are chained so a second click cannot interleave opens and break the pacing
export const openLinksInTabs = (urls: string[]) => {
  if (urls.length === 0) {
    return;
  }
  pendingBatch = pendingBatch
    .then(() => openBatch(urls))
    .catch((error) => {
      console.error('Failed to open forum links', error);
    });
};
