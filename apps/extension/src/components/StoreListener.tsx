import { startHistoryWatch } from '@/utils/history';
import useHistoryStore from '@store/history';
import { memo, useEffect } from 'react';

const StoreListener = memo(function StoreListener() {
  const monitorHistory = useHistoryStore((state) => state.monitorHistory);

  useEffect(() => {
    if (monitorHistory) {
      startHistoryWatch();
    }
  }, [monitorHistory]);

  return null;
});

export default StoreListener;
