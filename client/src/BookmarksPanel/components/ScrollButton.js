import { IconButton } from "@material-ui/core";
import ExpandLessRoundedIcon from "@material-ui/icons/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import { COLOR } from "GlobalConstants/color";
import { memo, useEffect, useState } from "react";
import { debounce } from "throttle-debounce";
import {
  BOOKMARK_PANEL_CONTENT_HEIGHT,
  BOOKMARK_ROW_DIMENTSIONS,
} from "../constants";

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

  const scrollListener = debounce(10, () => {
    const node = document.body;
    const parentNode = node.parentNode;
    var percentScrolled =
      ((node.scrollTop || parentNode.scrollTop) /
        (parentNode.scrollHeight - parentNode.clientHeight)) *
      100;
    setPercentScrolled(Math.round(percentScrolled));
  });

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
    const minReqBookmarksToScroll = Math.ceil(
      BOOKMARK_PANEL_CONTENT_HEIGHT / BOOKMARK_ROW_DIMENTSIONS.height
    );
    setIsShown(totalBookmarks > minReqBookmarksToScroll);
  }, [bookmarks, containerId]);

  if (!isShown) {
    return null;
  }

  return (
    <IconButton
      sx={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        backgroundColor: COLOR.grey.color,
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
  );
});
