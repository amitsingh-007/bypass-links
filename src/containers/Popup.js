import { Box, Typography } from "@material-ui/core";
import red from "@material-ui/core/colors/red";
import { Authenticate } from "GlobalComponents/Authenticate";
import { EditPanel } from "GlobalComponents/EditPanel";
import { EditPanelButton } from "GlobalComponents/EditPanelButton";
import { ManualHistoryPanel } from "GlobalComponents/ManualHistoryPanel";
import { ManualHistoryPanelButton } from "GlobalComponents/ManualHistoryPanelButton";
import { ToggleExtension } from "GlobalComponents/ToggleExtension";
import { ToggleHistory } from "GlobalComponents/ToggleHistory";
import React, { memo } from "react";
import { useSelector } from "react-redux";

export const Popup = memo(() => {
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
});
