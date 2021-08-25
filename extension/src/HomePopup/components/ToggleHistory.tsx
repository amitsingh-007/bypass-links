import { Box, FormControlLabel } from "@material-ui/core";
import { StyledSwitch } from "GlobalComponents/StyledComponents";
import { startHistoryWatch } from "GlobalContainers/StoreListener";
import history from "GlobalHelpers/chrome/history";
import storage from "GlobalHelpers/chrome/storage";
import { RootState } from "GlobalReducers/rootReducer";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";

const endHistoryWatch = async () => {
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

const ToggleHistory = memo(function ToggleHistory() {
  const dispatch = useDispatch();
  const [isHistoryActive, setIsHistoryActive] = useState(false);
  const { startHistoryMonitor } = useSelector(
    (state: RootState) => state.history
  );
  const { isExtensionActive } = useSelector(
    (state: RootState) => state.extension
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

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = event.target.checked;
    if (isActive) {
      turnOnHistory();
    } else {
      turnOffHistory();
    }
  };

  return (
    <FormControlLabel
      control={
        <StyledSwitch
          checked={isHistoryActive}
          onChange={handleToggle}
          disabled={!isExtensionActive}
        />
      }
      label={<Box sx={{ mr: "3px" }}>Watch</Box>}
      labelPlacement="start"
      sx={{ ml: 0, justifyContent: "space-between" }}
    />
  );
});

export default ToggleHistory;
