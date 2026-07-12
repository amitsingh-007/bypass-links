import { Switch } from '@bypass/ui';
import { useEffect, useEffectEvent, useState } from 'react';

import { historyStartTimeItem } from '@/storage/items';
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
  console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
  console.log(`End DateTime is: ${new Date(historyEndTime)}`);
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
  const [isHistoryActive, setIsHistoryActive] = useState(false);

  const turnOffHistory = () => {
    if (isHistoryActive) {
      endHistoryWatch();
      setIsHistoryActive(false);
    }
  };
  const onExtensionInactive = useEffectEvent(turnOffHistory);

  const turnOnHistory = async () => {
    if (!isHistoryActive) {
      resetHistoryMonitor();
      await startHistoryWatch();
      setIsHistoryActive(true);
    }
  };
  const onMonitorHistory = useEffectEvent(turnOnHistory);

  // Init toggle on mount
  useEffect(() => {
    historyStartTimeItem.getValue().then((historyStartTime) => {
      setIsHistoryActive(Boolean(historyStartTime));
    });
  }, []);

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
