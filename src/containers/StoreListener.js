import storage from "ChromeApi/storage";
import { memo, useEffect } from "react";
import { useSelector } from "react-redux";

const THIRTY_SECONDS = 30 * 1000; //in milliseconds
export const startHistoryWatch = async () => {
  await storage.set({
    historyStartTime: new Date() - THIRTY_SECONDS, //to compensate for open defaults
  });
};

const StoreListener = memo(() => {
  const startHistoryMonitor = useSelector((state) => state.startHistoryMonitor);

  useEffect(() => {
    if (startHistoryMonitor) {
      startHistoryWatch();
    }
  }, [startHistoryMonitor]);

  return null;
});

export default StoreListener;
