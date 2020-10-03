import { Box, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CancelTwoToneIcon from "@material-ui/icons/CancelTwoTone";
import CheckCircleTwoToneIcon from "@material-ui/icons/CheckCircleTwoTone";
import React, { useEffect, useState } from "react";
import { EXTENSION_STATE } from "../constants";

export const PopupContent = () => {
  const [extState, setExtState] = useState("...");

  useEffect(() => {
    chrome.storage.sync.get(["extState"], ({ extState }) => {
      console.log(`Extension currently is ${extState}.`);
      setExtState(extState);
    });
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="80px"
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
    </Box>
  );
};
