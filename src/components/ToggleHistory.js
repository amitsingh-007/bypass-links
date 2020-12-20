import { Box, Switch } from "@material-ui/core";
import VisibilityOffTwoToneIcon from "@material-ui/icons/VisibilityOffTwoTone";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";
import history from "ChromeApi/history";
import storage from "ChromeApi/storage";
import { getOffIconColor, getOnIconColor } from "GlobalUtils/color";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const THIRTY_SECONDS = 30 * 1000; //in milliseconds

export const startHistoryWatch = async () => {
  storage.set({
    historyStartTime: new Date() - THIRTY_SECONDS, //to compensate for open defaults
  });
};

export const endHistoryWatch = async () => {
  const { historyStartTime } = await storage.get(["historyStartTime"]);
  if (!historyStartTime) {
    console.log("Nothing to clear.");
    return;
  }
  const historyEndTime = Date.now();
  console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
  console.log(`End DateTime is: ${new Date(historyEndTime)}`);
  await history.deleteRange({
    startTime: historyStartTime,
    endTime: historyEndTime,
  });
  storage.remove("historyStartTime");
  console.log("History clear successful.");
};

export const ToggleHistory = memo(() => {
  const [isHistoryActive, setIsHistoryActive] = useState(false);
  const { isExtensionActive, startHistoryMonitor } = useSelector(
    (state) => state
  );

  const turnOffHistory = useCallback(() => {
    if (isHistoryActive) {
      endHistoryWatch();
      setIsHistoryActive(false);
    }
  }, [isHistoryActive]);

  const turnOnHistory = useCallback(() => {
    if (!isHistoryActive) {
      startHistoryWatch();
      setIsHistoryActive(true);
    }
  }, [isHistoryActive]);

  //Init toggle on mount
  useEffect(() => {
    storage.get(["historyStartTime"]).then(({ historyStartTime }) => {
      setIsHistoryActive(!!historyStartTime);
    });
  }, []);

  //Turn off history when extension is off
  useEffect(() => {
    if (!isExtensionActive) {
      turnOffHistory();
    }
  }, [isExtensionActive, turnOffHistory]);

  //Turn on history on store change
  useEffect(() => {
    if (startHistoryMonitor) {
      turnOnHistory();
    }
  }, [startHistoryMonitor, turnOnHistory]);

  const handleToggle = async (event) => {
    const isActive = event.target.checked;
    if (isActive) {
      turnOnHistory();
    } else {
      turnOffHistory();
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <VisibilityOffTwoToneIcon htmlColor={getOffIconColor(isHistoryActive)} />
      <Switch
        checked={isHistoryActive}
        onChange={handleToggle}
        color="primary"
        name="historyWatch"
        disabled={!isExtensionActive}
      />
      <VisibilityTwoToneIcon htmlColor={getOnIconColor(isHistoryActive)} />
    </Box>
  );
});
