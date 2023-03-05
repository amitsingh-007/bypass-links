const THIRTY_SECONDS = 30 * 1000; // in milliseconds

const isHistoryAlreadyActive = async () => {
  const { historyStartTime } = await chrome.storage.local.get([
    'historyStartTime',
  ]);
  return Boolean(historyStartTime);
};

export const startHistoryWatch = async () => {
  if (await isHistoryAlreadyActive()) {
    return;
  }
  await chrome.storage.local.set({
    historyStartTime: Date.now() - THIRTY_SECONDS,
  });
};
