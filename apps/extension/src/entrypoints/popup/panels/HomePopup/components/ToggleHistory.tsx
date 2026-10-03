import { Switch } from '@bypass/ui';
import { useEffect } from 'react';

import { EExtensionState } from '@/constants';
import { useExtensionState, useHistoryStartTime } from '@/storage/hooks';
import { startHistoryWatch, stopHistoryWatch } from '@/utils/history';

const handleToggle = (checked: boolean) =>
  checked ? startHistoryWatch() : stopHistoryWatch();

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
