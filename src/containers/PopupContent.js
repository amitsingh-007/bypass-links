import { Box, Typography } from "@material-ui/core";
import red from "@material-ui/core/colors/red";
import React from "react";
import { useSelector } from "react-redux";
import { Authenticate } from "../components/Authenticate";
import { EditPanel } from "../components/EditPanel";
import { EditPanelButton } from "../components/EditPanelButton";
import { ManualHistoryPanel } from "../components/ManualHistoryPanel";
import { ManualHistoryPanelButton } from "../components/ManualHistoryPanelButton";
import { ToggleExtension } from "../components/ToggleExtension";
import { ToggleHistory } from "../components/ToggleHistory";

export const PopupContent = () => {
  const showEditPanel = useSelector((state) => state.showEditPanel);
  const showManualHistoryPanel = useSelector(
    (state) => state.showManualHistoryPanel
  );

  if (showEditPanel) {
    return <EditPanel />;
  }

  if (showManualHistoryPanel) {
    return <ManualHistoryPanel />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="12px"
      width="max-content"
    >
      <Typography variant="h5" component="h5" gutterBottom>
        <Box color={red[300]} fontWeight="700">
          BYPASS LINKS
        </Box>
      </Typography>
      <ToggleExtension />
      <ToggleHistory />
      <Box marginTop="8.4px">
        <Authenticate />
        <EditPanelButton />
        <ManualHistoryPanelButton />
      </Box>
    </Box>
  );
};
