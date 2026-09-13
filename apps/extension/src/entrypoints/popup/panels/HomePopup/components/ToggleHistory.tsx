import { Switch } from '@bypass/ui';
import { useEffect, useEffectEvent } from 'react';

import { historyStartTimeItem } from '@/storage/items';
import useExtStore from '@store/extension';
import useHistoryStore from '@store/history';

const endHistoryWatch = async () => {
  const historyStartTime = await historyStartTimeItem.getValue();
  if (!historyStartTime) {
    console.log('Nothing to clear.');
    return;
  }
  const historyEndTime = Date.now();
  console.log(`Start DateTime is: ${new Date(historyStartTime).toString()}`);
  console.log(`End DateTime is: ${new Date(historyEndTime).toString()}`);
  await browser.history.deleteRange({
    startTime: historyStartTime,
    endTime: historyEndTime,
  });
  await historyStartTimeItem.removeValue();
  console.log('History clear successful.');
};

function ToggleHistory() {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isHistoryActive = useHistoryStore((state) => state.isHistoryActive);
  const setIsHistoryActive = useHistoryStore(
    (state) => state.setIsHistoryActive
  );
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);

  const turnOffHistory = async () => {
    if (isHistoryActive) {
      await endHistoryWatch();
      setIsHistoryActive(false);
    }
  };
  const onExtensionInactive = useEffectEvent(turnOffHistory);

  const turnOnHistory = async () => {
    if (!isHistoryActive) {
      await startHistoryMonitor();
    }
  };

  useEffect(() => {
    historyStartTimeItem.getValue().then((historyStartTime) => {
      setIsHistoryActive(Boolean(historyStartTime));
    });
  }, [setIsHistoryActive]);

  useEffect(() => {
    if (!isExtensionActive) {
      onExtensionInactive();
    }
  }, [isExtensionActive]);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await turnOnHistory();
    } else {
      await turnOffHistory();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isHistoryActive}
        disabled={!isExtensionActive}
        data-testid="toggle-history-switch"
        onCheckedChange={handleToggle}
      />
      <span className="text-sm">History</span>
    </div>
  );
}

export default ToggleHistory;
