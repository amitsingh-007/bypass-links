import { Box, Typography } from "@material-ui/core/";
import { Authenticate } from "GlobalComponents/Authenticate";
import QuickBookmarkButton from "GlobalComponents/QuickBookmarkButton";
import { EditPanel } from "GlobalComponents/EditPanel";
import { EditPanelButton } from "GlobalComponents/EditPanelButton";
import { ManualHistoryPanel } from "GlobalComponents/ManualHistoryPanel";
import { ManualHistoryPanelButton } from "GlobalComponents/ManualHistoryPanelButton";
import { OpenDefaultsButton } from "GlobalComponents/OpenDefaultsButton";
import { Row } from "GlobalComponents/Row";
import { ToggleExtension } from "GlobalComponents/ToggleExtension";
import { ToggleHistory } from "GlobalComponents/ToggleHistory";
import { COLOR } from "GlobalConstants/color";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import BookmarksPanelButton from "GlobalComponents/BookmarksPanelButton";
import BookmarksPanel from "GlobalComponents/BookmarksPanel";
import QuickBookmarkPanel from "GlobalComponents/QuickBookmarkPanel";

export const Popup = memo(() => {
  const {
    showEditPanel,
    showManualHistoryPanel,
    showBookmarksPanel,
    showQuickBookmarkPanel,
  } = useSelector((state) => state);

  if (showEditPanel) {
    return <EditPanel />;
  }
  if (showManualHistoryPanel) {
    return <ManualHistoryPanel />;
  }
  if (showBookmarksPanel) {
    return <BookmarksPanel />;
  }
  if (showQuickBookmarkPanel.showPanel) {
    return <QuickBookmarkPanel />;
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="16px"
      width="max-content"
    >
      <Typography variant="h5" component="h5" gutterBottom>
        <Box color={COLOR.heading} fontWeight="700">
          BYPASS LINKS
        </Box>
      </Typography>
      <ToggleExtension />
      <ToggleHistory />
      <Row>
        <Authenticate />
        <EditPanelButton />
        <BookmarksPanelButton />
      </Row>
      <Box>
        <ManualHistoryPanelButton />
        <OpenDefaultsButton />
        <QuickBookmarkButton />
      </Box>
    </Box>
  );
});
