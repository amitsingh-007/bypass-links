import { Box, Typography } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { Authenticate } from "./Authenticate";
import { EditPanel } from "./EditPanel";
import { EditPanelButton } from "./EditPanelButton";
import { ToggleExtension } from "./ToggleExtension";
import { ToggleHistory } from "./ToggleHistory";

export const PopupContent = () => {
  const showEditPanel = useSelector((state) => state.showEditPanel);

  if (showEditPanel) {
    return <EditPanel />;
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
        <Authenticate />
        <EditPanelButton />
      </Box>
    </Box>
  );
};
