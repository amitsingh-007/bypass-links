import { Box, Typography } from "@material-ui/core/";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";
import Authenticate from "../components/Authenticate";
import BookmarksPanelButton from "../components/BookmarksPanelButton";
import HistoryPanelButton from "../components/HistoryPanelButton";
import LastVisitedButton from "../components/LastVisitedButton";
import OpenDefaultsButton from "../components/OpenDefaultsButton";
import OpenForumLinks from "../components/OpenForumLinks";
import PersonsPanelButton from "../components/PersonsPanelButton";
import QuickBookmarkButton from "../components/QuickBookmarkButton";
import { Row } from "../components/Row";
import ShortcutsPanelButton from "../components/ShortcutsPanelButton";
import ToggleExtension from "../components/ToggleExtension";
import ToggleHistory from "../components/ToggleHistory";
import TwoFactorAuthenticate from "../components/TwoFactorAuthenticate";
import UserProfile from "../components/UserProfile";

const PopupHome = memo(function PopupHome() {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px",
          width: "218px",
          "> *": { userSelect: "none" },
        }}
      >
        <Typography variant="h5" component="h5" gutterBottom>
          <Box sx={{ color: COLOR.heading, fontWeight: "700" }}>
            BYPASS LINKS
          </Box>
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ToggleExtension />
            <ToggleHistory />
          </Box>
          <UserProfile />
        </Box>
        <Row styles={{ marginTop: "15px" }}>
          <Authenticate />
          <ShortcutsPanelButton />
          <BookmarksPanelButton />
        </Row>
        <Row>
          <HistoryPanelButton />
          <OpenDefaultsButton />
          <QuickBookmarkButton />
        </Row>
        <Row>
          <OpenForumLinks />
          <LastVisitedButton />
          <PersonsPanelButton />
        </Row>
      </Box>
      <TwoFactorAuthenticate />
    </>
  );
});

export default PopupHome;
