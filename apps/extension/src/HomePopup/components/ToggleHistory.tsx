import { getHistoryTime } from '@helpers/fetchFromStorage';
import { Switch } from '@mantine/core';
import useExtStore from '@store/extension';
import useHistoryStore from '@store/history';
import { useCallback, useEffect, useState } from 'react';
import { startHistoryWatch } from '@/utils/history';

const endHistoryWatch = async () => {
  const historyStartTime = await getHistoryTime();
  if (!historyStartTime) {
    console.log('Nothing to clear.');
    return;
  }
  const historyEndTime = Date.now();
  console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
  console.log(`End DateTime is: ${new Date(historyEndTime)}`);
  await chrome.history.deleteRange({
    startTime: historyStartTime,
    endTime: historyEndTime,
  });
  chrome.storage.local.remove('historyStartTime');
  console.log('History clear successful.');
};

function ToggleHistory() {
  const resetHistoryMonitor = useHistoryStore(
    (state) => state.resetHistoryMonitor
  );
  const monitorHistory = useHistoryStore((state) => state.monitorHistory);
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const [isHistoryActive, setIsHistoryActive] = useState(false);

  const turnOffHistory = useCallback(() => {
    if (isHistoryActive) {
      endHistoryWatch();
      setIsHistoryActive(false);
    }
  }, [isHistoryActive]);

  const turnOnHistory = useCallback(async () => {
    if (!isHistoryActive) {
      resetHistoryMonitor();
      await startHistoryWatch();
      setIsHistoryActive(true);
    }
  }, [isHistoryActive, resetHistoryMonitor]);

  // Init toggle on mount
  useEffect(() => {
    getHistoryTime().then((historyStartTime) => {
      setIsHistoryActive(Boolean(historyStartTime));
    });
  }, []);

  // Turn off history when extension is off
  useEffect(() => {
    if (!isExtensionActive) {
      turnOffHistory();
    }
  }, [isExtensionActive, turnOffHistory]);

  // Turn on history on store change
  useEffect(() => {
    if (monitorHistory) {
      turnOnHistory();
    }
  }, [monitorHistory, turnOnHistory]);

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = event.target.checked;
    if (isActive) {
      await turnOnHistory();
    } else {
      turnOffHistory();
    }
  };

  return (
    <Switch
      size="md"
      label="History"
      checked={isHistoryActive}
      disabled={!isExtensionActive}
      onChange={handleToggle}
    />
  );
}

export default ToggleHistory;
