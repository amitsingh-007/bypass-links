import { sleep } from '@bypass/shared';

import { startHistoryWatch } from '@/utils/history';

const TAB_OPEN_DELAY_MS = 1000;

export const openLinksInTabs = async (urls: string[]) => {
  if (urls.length === 0) {
    return;
  }
  await startHistoryWatch();

  /* oxlint-disable no-await-in-loop */
  for (const url of urls) {
    await browser.tabs.create({ url, active: false });
    // Paced deliberately: forums rate-limit rapid opens
    await sleep(TAB_OPEN_DELAY_MS);
  }
  /* oxlint-enable no-await-in-loop */
};
