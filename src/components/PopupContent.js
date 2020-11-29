import { Box, Button, Typography } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import TransitEnterexitIcon from "@material-ui/icons/TransitEnterexit";
import React, { useEffect, useState } from "react";
import { EditPanel } from "./EditPanel";
import { ToggleExtension } from "./ToggleExtension";
import { ToggleHistory } from "./ToggleHistory";

export const PopupContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(["isAuthenticated"], ({ isAuthenticated }) => {
      setIsAuthenticated(isAuthenticated);
    });
  }, []);

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
      <ToggleHistory />
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
