import { Box, CircularProgress, IconButton } from "@material-ui/core";
import ExpandLessRoundedIcon from "@material-ui/icons/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import { COLOR } from "GlobalConstants/color";
import { memo, useCallback, useEffect, useState } from "react";
import {
  BOOKMARK_PANEL_CONTENT_HEIGHT,
  BOOKMARK_ROW_DIMENTSIONS,
} from "../constants";

const minReqBookmarksToScroll = Math.ceil(
  BOOKMARK_PANEL_CONTENT_HEIGHT / BOOKMARK_ROW_DIMENTSIONS.height
);

const getPercentScrolled = () => {
  const node = document.body;
  const parentNode = node.parentNode;
  return (
    ((node.scrollTop || parentNode.scrollTop) /
      (parentNode.scrollHeight - parentNode.clientHeight)) *
    100
  );
};

export const ScrollUpButton = memo(({ containerId, bookmarks }) => {
  const [isShown, setIsShown] = useState(false);
  const [percentScrolled, setPercentScrolled] = useState(0);

  const handleScrollClick = () => {
    const nodes = document.getElementById(containerId).childNodes;
    if (!nodes?.length) {
      return;
    }
    const nodeToScroll =
      percentScrolled > 50 ? nodes[0] : nodes[nodes.length - 1];
    nodeToScroll.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const scrollListener = useCallback(() => {
    const percentScrolled = getPercentScrolled();
    setPercentScrolled(Math.round(percentScrolled));
  }, []);

  useEffect(() => {
    if (!isShown) {
      return;
    }
    document.addEventListener("scroll", scrollListener);
    return () => {
      document.removeEventListener("scroll", scrollListener);
    };
  }, [isShown, scrollListener]);

  useEffect(() => {
    const totalBookmarks = bookmarks?.length || 0;
    setIsShown(totalBookmarks > minReqBookmarksToScroll);
    setPercentScrolled(getPercentScrolled());
  }, [bookmarks, containerId]);

  if (!isShown) {
    return null;
  }

  return (
    <Box sx={{ position: "fixed", bottom: "10px", right: "10px", zIndex: 1 }}>
      <Box sx={{ position: "relative" }}>
        <CircularProgress variant="determinate" value={percentScrolled} />
        <IconButton
          sx={{
            backgroundColor: COLOR.grey.color,
            padding: "4.5px",
            position: "absolute",
            top: "3.8px",
            left: "3.8px",
            ":hover": {
              backgroundColor: COLOR.grey.color,
            },
          }}
          size="small"
          onClick={handleScrollClick}
        >
          {percentScrolled > 50 ? (
            <ExpandLessRoundedIcon />
          ) : (
            <ExpandMoreRoundedIcon />
          )}
        </IconButton>
      </Box>
    </Box>
  );
});
