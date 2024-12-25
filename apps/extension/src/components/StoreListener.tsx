import { startHistoryWatch } from '@/utils/history';
import useHistoryStore from '@store/history';
import { useEffect } from 'react';

const StoreListener = () => {
  const monitorHistory = useHistoryStore((state) => state.monitorHistory);

  useEffect(() => {
    if (monitorHistory) {
      startHistoryWatch();
    }
  }, [monitorHistory]);

  return null;
};

export default StoreListener;
