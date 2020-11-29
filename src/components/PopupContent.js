import { Box, Button, Switch, Typography } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import TransitEnterexitIcon from "@material-ui/icons/TransitEnterexit";
import React, { useEffect, useState } from "react";
import { EditPanel } from "./EditPanel";
import { ToggleExtension } from "./ToggleExtension";

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
  const [isHistoryActive, setIsHistoryActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(
      ["historyStartTime", "isAuthenticated"],
      ({ historyStartTime, isAuthenticated }) => {
        setIsHistoryActive(!!historyStartTime);
        setIsAuthenticated(isAuthenticated);
      }
    );
  }, []);

  const handleHistorySwitchChange = (event) => {
    const isActive = event.target.checked;
    console.log(isActive);
    setIsHistoryActive(isActive);
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

  const handleSignOut = () => {
    chrome.runtime.sendMessage({ triggerSignOut: true }, ({ isSignedOut }) => {
      if (isSignedOut) {
        setIsAuthenticated(false);
      }
    });
  };

  const handleRedirectionEdit = () => {
    setShowEditPanel(true);
  };

  if (showEditPanel) {
    return <EditPanel setShowEditPanel={setShowEditPanel} />;
  }

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
      <ToggleExtension />
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
            startIcon={<TransitEnterexitIcon />}
            onClick={handleSignOut}
          >
            <Box component="span" fontWeight="bold">
              Sign Out
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
      <Box marginTop="8.4px">
        {isAuthenticated ? (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleRedirectionEdit}
          >
            <Box component="span" fontWeight="bold">
              Redirections
            </Box>
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};
