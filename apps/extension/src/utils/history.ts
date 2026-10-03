import { historyStartTimeItem } from '@/storage/items';

const THIRTY_SECONDS = 30 * 1000; // In milliseconds
let pendingStop: Promise<void> | undefined;

const isHistoryAlreadyActive = async () => {
  const historyStartTime = await historyStartTimeItem.getValue();
  return Boolean(historyStartTime);
};

export const startHistoryWatch = async () => {
  await pendingStop;
  if (await isHistoryAlreadyActive()) {
    return;
  }
  await historyStartTimeItem.setValue(Date.now() - THIRTY_SECONDS);
};

export const stopHistoryWatch = () => {
  pendingStop ??= (async () => {
    const historyStartTime = await historyStartTimeItem.getValue();
    if (!historyStartTime) return;
    await browser.history.deleteRange({
      startTime: historyStartTime,
      endTime: Date.now(),
    });
    await historyStartTimeItem.removeValue();
  })().finally(() => {
    pendingStop = undefined;
  });
  return pendingStop;
};
