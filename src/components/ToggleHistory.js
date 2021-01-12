import { Box, Switch } from "@material-ui/core";
import VisibilityOffTwoToneIcon from "@material-ui/icons/VisibilityOffTwoTone";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";
import history from "ChromeApi/history";
import storage from "ChromeApi/storage";
import { resetHistoryMonitor } from "GlobalActionCreators/";
import { startHistoryWatch } from "GlobalContainers/StoreListener";
import { getOffIconColor, getOnIconColor } from "GlobalUtils/color";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
  const dispatch = useDispatch();
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

  const turnOnHistory = useCallback(async () => {
    if (!isHistoryActive) {
      dispatch(resetHistoryMonitor());
      await startHistoryWatch();
      setIsHistoryActive(true);
    }
  }, [dispatch, isHistoryActive]);

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
    <Box sx={{ display: "flex", alignItems: "center" }}>
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
