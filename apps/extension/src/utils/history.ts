import { getHistoryTime } from '@/helpers/fetchFromStorage';

const THIRTY_SECONDS = 30 * 1000; // In milliseconds

const isHistoryAlreadyActive = async () => {
  const historyStartTime = await getHistoryTime();
  return Boolean(historyStartTime);
};

export const startHistoryWatch = async () => {
  if (await isHistoryAlreadyActive()) {
    return;
  }
  await browser.storage.local.set({
    historyStartTime: Date.now() - THIRTY_SECONDS,
  });
};
