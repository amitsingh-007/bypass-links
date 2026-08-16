import { Switch } from '@bypass/ui';
import { useEffect, useEffectEvent } from 'react';
import useSWR from 'swr';

import { historyStartTimeItem } from '@/storage/items';
import { extSwrKeys } from '@/swr/keys';
import { startHistoryWatch } from '@/utils/history';
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
  const resetHistoryMonitor = useHistoryStore(
    (state) => state.resetHistoryMonitor
  );
  const monitorHistory = useHistoryStore((state) => state.monitorHistory);
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const { data: isHistoryActive = false, mutate } = useSWR(
    extSwrKeys.historyActive,
    async () => Boolean(await historyStartTimeItem.getValue())
  );

  const turnOffHistory = async () => {
    if (isHistoryActive) {
      await endHistoryWatch();
      await mutate();
    }
  };
  const onExtensionInactive = useEffectEvent(turnOffHistory);

  const turnOnHistory = async () => {
    if (!isHistoryActive) {
      resetHistoryMonitor();
      await startHistoryWatch();
      await mutate();
    }
  };
  const onMonitorHistory = useEffectEvent(turnOnHistory);

  // Turn off history when extension is off
  useEffect(() => {
    if (!isExtensionActive) {
      onExtensionInactive();
    }
  }, [isExtensionActive]);

  // Turn on history on store change
  useEffect(() => {
    if (monitorHistory) {
      onMonitorHistory();
    }
  }, [monitorHistory]);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await turnOnHistory();
    } else {
      turnOffHistory();
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
