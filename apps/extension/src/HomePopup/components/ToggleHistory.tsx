import { startHistoryWatch } from '@/components/StoreListener';
import history from '@helpers/chrome/history';
import storage from '@helpers/chrome/storage';
import { Switch, useMantineTheme } from '@mantine/core';
import useExtStore from '@store/extension';
import useHistoryStore from '@store/history';
import { memo, useCallback, useEffect, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const endHistoryWatch = async () => {
  const { historyStartTime } = await storage.get(['historyStartTime']);
  if (!historyStartTime) {
    console.log('Nothing to clear.');
    return;
  }
  const historyEndTime = Date.now();
  console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
  console.log(`End DateTime is: ${new Date(historyEndTime)}`);
  await history.deleteRange({
    startTime: historyStartTime,
    endTime: historyEndTime,
  });
  storage.remove('historyStartTime');
  console.log('History clear successful.');
};

const ToggleHistory = memo(function ToggleHistory() {
  const theme = useMantineTheme();
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
    storage.get(['historyStartTime']).then(({ historyStartTime }) => {
      setIsHistoryActive(!!historyStartTime);
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
      turnOnHistory();
    } else {
      turnOffHistory();
    }
  };

  return (
    <Switch
      onLabel="ON"
      offLabel="OFF"
      size="md"
      label="History"
      checked={isHistoryActive}
      onChange={handleToggle}
      disabled={!isExtensionActive}
      thumbIcon={
        isHistoryActive ? (
          <HiOutlineEye
            size={12}
            color={theme.colors.teal[theme.fn.primaryShade()]}
          />
        ) : (
          <HiOutlineEyeOff
            size={12}
            color={theme.colors.red[theme.fn.primaryShade()]}
          />
        )
      }
    />
  );
});

export default ToggleHistory;
