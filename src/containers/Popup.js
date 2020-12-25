import { Box, Typography } from "@material-ui/core/";
import { Authenticate } from "GlobalComponents/Authenticate";
import BookmarksPanelButton from "GlobalComponents/BookmarksPanelButton";
import { EditPanelButton } from "GlobalComponents/EditPanelButton";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { ManualHistoryPanelButton } from "GlobalComponents/ManualHistoryPanelButton";
import { OpenDefaultsButton } from "GlobalComponents/OpenDefaultsButton";
import OpenForumLinks from "GlobalComponents/OpenForumLinks";
import QuickBookmarkButton from "GlobalComponents/QuickBookmarkButton";
import { Row } from "GlobalComponents/Row";
import { ToggleExtension } from "GlobalComponents/ToggleExtension";
import { ToggleHistory } from "GlobalComponents/ToggleHistory";
import { COLOR } from "GlobalConstants/color";
import React, { lazy, memo, Suspense } from "react";
import { useSelector } from "react-redux";

const BookmarksPanel = lazy(() => import("GlobalComponents/BookmarksPanel"));
const ManualHistoryPanel = lazy(() =>
  import("GlobalComponents/ManualHistoryPanel")
);
const QuickBookmarkPanel = lazy(() =>
  import("GlobalComponents/QuickBookmarkPanel")
);

export const Popup = memo(() => {
  const {
    showManualHistoryPanel,
    showBookmarksPanel,
    showQuickBookmarkPanel,
  } = useSelector((state) => state);

  if (showManualHistoryPanel) {
    return (
      <Suspense fallback={<IconButtonLoader />}>
        <ManualHistoryPanel />
      </Suspense>
    );
  }
  if (showBookmarksPanel) {
    return (
      <Suspense fallback={<IconButtonLoader />}>
        <BookmarksPanel />
      </Suspense>
    );
  }
  if (showQuickBookmarkPanel.showPanel) {
    return (
      <Suspense fallback={<IconButtonLoader />}>
        <QuickBookmarkPanel />
      </Suspense>
    );
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
      <Box>
        <OpenForumLinks />
      </Box>
    </Box>
  );
});
