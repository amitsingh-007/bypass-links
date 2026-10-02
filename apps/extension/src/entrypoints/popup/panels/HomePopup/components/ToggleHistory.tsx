import { Switch } from '@bypass/ui';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { EExtensionState } from '@/constants';
import { useExtensionState, useHistoryStartTime } from '@/storage/hooks';
import { historyStartTimeItem } from '@/storage/items';
import { startHistoryWatch } from '@/utils/history';

const endHistoryWatch = async () => {
  const historyStartTime = await historyStartTimeItem.getValue();
  if (!historyStartTime) {
    return;
  }
  const historyEndTime = Date.now();
  await browser.history.deleteRange({
    startTime: historyStartTime,
    endTime: historyEndTime,
  });
  await historyStartTimeItem.removeValue();
};

const handleToggle = async (checked: boolean) => {
  try {
    if (checked) {
      await startHistoryWatch();
    } else {
      await endHistoryWatch();
    }
  } catch (error) {
    console.error('Could not update history tracking', error);
    toast.error('Could not update history tracking');
  }
};

function ToggleHistory() {
  const historyStartTime = useHistoryStartTime();
  const isHistoryActive = Boolean(historyStartTime);
  const isExtensionActive = useExtensionState() === EExtensionState.ACTIVE;

  useEffect(() => {
    if (!isExtensionActive && historyStartTime) {
      void handleToggle(false);
    }
  }, [isExtensionActive, historyStartTime]);

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
