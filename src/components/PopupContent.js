import { Box, Button, Switch, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CancelTwoToneIcon from "@material-ui/icons/CancelTwoTone";
import CheckCircleTwoToneIcon from "@material-ui/icons/CheckCircleTwoTone";
import React, { useEffect, useState } from "react";
import { EXTENSION_STATE } from "../constants";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";

const SWITCH_INPUT_PROPS = {
  "aria-label": "primary checkbox",
};
const switchTextStyles = {
  fontSize: "19px",
  paddingRight: "12px",
};

const handleHistoryStart = () => {
  const historyStartTime = Date.now();
  chrome.storage.sync.set({ historyStartTime }, () => {
    console.log(`historyStartTime is set to ${historyStartTime}.`);
  });
};

const handleHistoryClear = (setIsHistoryActive) => {
  chrome.storage.sync.get(["historyStartTime"], ({ historyStartTime }) => {
    if (!historyStartTime) {
      console.error("No start date/time to clear the history.");
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
        setIsHistoryActive(false);
        chrome.storage.sync.remove("historyStartTime");
        console.log("History cleared.");
      }
    );
  });
};

export const PopupContent = () => {
  const [extState, setExtState] = useState("...");
  const [isHistoryActive, setIsHistoryActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!__IS_BROWSER__) {
      chrome.storage.sync.get(
        ["extState", "historyStartTime", "isAuthenticated"],
        ({ extState, historyStartTime, isAuthenticated }) => {
          console.log(`Extension currently is ${extState}.`);
          setExtState(extState);
          setIsHistoryActive(!!historyStartTime);
          setIsAuthenticated(isAuthenticated);
        }
      );
    }
  }, []);

  const handleHistorySwitchChange = (event) => {
    const isActive = event.target.checked;
    console.log(isActive);
    setIsHistoryActive(isActive);
    if (__IS_BROWSER__) {
      return;
    }
    if (isActive) {
      handleHistoryStart();
    } else {
      handleHistoryClear(setIsHistoryActive);
    }
  };

  const handleSignIn = () => {
    chrome.runtime.sendMessage(
      { triggerSignIn: true },
      ({ isAuthenticated }) => {
        if (isAuthenticated) {
          setIsAuthenticated(true);
        }
      }
    );
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
          checked={isHistoryActive}
          onChange={handleHistorySwitchChange}
          color="primary"
          name="historyWatch"
          inputProps={SWITCH_INPUT_PROPS}
        />
        <Box component="span" display="inline-block">
          <Typography variant="h5" component="h5" style={switchTextStyles}>
            {isHistoryActive ? "Watching" : "Inactive"}
          </Typography>
        </Box>
      </Box>
      <Box marginTop="8.4px">
        {isAuthenticated ? (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ThumbUpIcon />}
            disabled
          >
            <Box component="span" fontWeight="bold">
              Signed In
            </Box>
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExitToAppIcon />}
            onClick={handleSignIn}
          >
            <Box component="span" fontWeight="bold">
              Sign In
            </Box>
          </Button>
        )}
      </Box>
    </Box>
  );
};
