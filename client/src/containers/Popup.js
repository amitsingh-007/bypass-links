import { Box, Typography } from "@material-ui/core/";
import { Authenticate } from "GlobalComponents/Authenticate";
import LastVisitedButton from "GlobalComponents/LastVisitedButton";
import { ManualHistoryPanelButton } from "GlobalComponents/ManualHistoryPanelButton";
import { OpenDefaultsButton } from "GlobalComponents/OpenDefaultsButton";
import OpenForumLinks from "GlobalComponents/OpenForumLinks";
import QuickBookmarkButton from "SrcPath/BookmarksPanel/components/QuickBookmarkButton";
import { Row } from "GlobalComponents/Row";
import { ToggleExtension } from "GlobalComponents/ToggleExtension";
import { ToggleHistory } from "GlobalComponents/ToggleHistory";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";
import BookmarksPanelButton from "SrcPath/BookmarksPanel/components/BookmarksPanelButton";
import ShortcutsPanelButton from "SrcPath/ShortcutsPanel/components/ShortcutsPanelButton";
import TaggingPanelButton from "SrcPath/TaggingPanel/components/TaggingPanelButton";

export const Popup = memo(() => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
      width: "max-content",
    }}
  >
    <Typography variant="h5" component="h5" gutterBottom>
      <Box sx={{ color: COLOR.heading, fontWeight: "700" }}>BYPASS LINKS</Box>
    </Typography>
    <ToggleExtension />
    <ToggleHistory />
    <Row>
      <Authenticate />
      <ShortcutsPanelButton />
      <BookmarksPanelButton />
    </Row>
    <Box>
      <ManualHistoryPanelButton />
      <OpenDefaultsButton />
      <QuickBookmarkButton />
    </Box>
    <Box>
      <OpenForumLinks />
      <LastVisitedButton />
      <TaggingPanelButton />
    </Box>
  </Box>
));
