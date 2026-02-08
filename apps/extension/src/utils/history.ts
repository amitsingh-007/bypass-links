import { historyStartTimeItem } from '@/storage/items';

const THIRTY_SECONDS = 30 * 1000; // In milliseconds

const isHistoryAlreadyActive = async () => {
  const historyStartTime = await historyStartTimeItem.getValue();
  return Boolean(historyStartTime);
};

export const startHistoryWatch = async () => {
  if (await isHistoryAlreadyActive()) {
    return;
  }
  await historyStartTimeItem.setValue(Date.now() - THIRTY_SECONDS);
};
