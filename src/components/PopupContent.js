import { Box, Switch, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CancelTwoToneIcon from "@material-ui/icons/CancelTwoTone";
import CheckCircleTwoToneIcon from "@material-ui/icons/CheckCircleTwoTone";
import React, { useEffect, useState } from "react";
import { EXTENSION_STATE } from "../constants";

const SWITCH_INPUT_PROPS = {
  "aria-label": "primary checkbox",
};
const switchTextStyles = {
  fontSize: "19px",
  paddingRight: "12px",
};

export const PopupContent = () => {
  const [extState, setExtState] = useState("...");
  const [isHistoryWatchActive, setIsHistoryWatchActive] = useState(false);

  useEffect(() => {
    if (!__IS_BROWSER__) {
      chrome.storage.sync.get(
        ["extState", "historyStartTime"],
        ({ extState, historyStartTime }) => {
          console.log(`Extension currently is ${extState}.`);
          setExtState(extState);
          setIsHistoryWatchActive(!!historyStartTime);
        }
      );
    }
  }, []);

  const handleHistorySwitchChange = (event) => {
    const isActive = event.target.checked;
    console.log(isActive);
    setIsHistoryWatchActive(isActive);
    if (__IS_BROWSER__) {
      return;
    }
    if (isActive) {
      const historyStartTime = Date.now();
      chrome.storage.sync.set({ historyStartTime }, () => {
        console.log(`historyStartTime is set to ${historyStartTime}.`);
      });
    } else {
      chrome.storage.sync.get(["historyStartTime"], ({ historyStartTime }) => {
        if (!historyStartTime) {
          console.error("No start date time to clear history.");
        }
        const historyEndTime = Date.now();
        console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
        console.log(`End DateTime is: ${new Date(historyEndTime)}`);
        chrome.history.deleteRange(
          {
            startTime: historyStartTime,
            endTime: historyEndTime,
          },
          () => {
            console.log("History cleared.");
            setIsHistoryWatchActive(false);
            chrome.storage.sync.remove("historyStartTime");
          }
        );
      });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="200px"
      padding="14px"
    >
      <Typography variant="h5" component="h5" gutterBottom>
        <Box color="firebrick" fontWeight="700">
          BYPASS LINKS
        </Box>
      </Typography>
      {extState === EXTENSION_STATE.ACTIVE ? (
        <CheckCircleTwoToneIcon
          style={{ color: green[500] }}
          fontSize="large"
        />
      ) : (
        <CancelTwoToneIcon color="secondary" fontSize="large" />
      )}
      <Box marginTop="8.4px">
        <Switch
          checked={isHistoryWatchActive}
          onChange={handleHistorySwitchChange}
          color="primary"
          name="historyWatch"
          inputProps={SWITCH_INPUT_PROPS}
        />
        <Box component="span" display="inline-block">
          <Typography variant="h5" component="h5" style={switchTextStyles}>
            {isHistoryWatchActive ? "Watching" : "Inactive"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
