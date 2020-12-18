import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import tabs from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import React, { memo } from "react";

const textStyles = {
  cursor: "default",
  flexGrow: "1",
};

const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
  arrow: {
    color: theme.palette.common.white,
  },
}))(Tooltip);

const BookmarkRow = memo(({ url, title, pos, handleRemoveBookmark }) => {
  const handleRemoveClick = () => {
    handleRemoveBookmark(pos);
  };

  const handleOpenClick = () => {
    tabs.create({ url, selected: false });
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      paddingLeft="12px"
      paddingRight="9px"
      className="bookmarkRowContainer"
    >
      <Box display="flex" alignItems="center" flexGrow="1" maxWidth="720px">
        <Box
          component="img"
          width="17px"
          height="17px"
          marginRight="8px"
          src={`https://www.google.com/s2/favicons?sz=64&domain_url=${url}`}
        />
        <LightTooltip
          title={<Typography style={{ fontSize: "12px" }}>{url}</Typography>}
          arrow
        >
          <Typography noWrap style={textStyles}>
            {title}
          </Typography>
        </LightTooltip>
      </Box>
      <Box display="flex" alignItems="center">
        <IconButton
          edge="end"
          aria-label="Remove"
          title="Delete"
          style={COLOR.red}
          size="small"
        >
          <DeleteTwoToneIcon onClick={handleRemoveClick} />
        </IconButton>
        <IconButton
          aria-label="Open"
          title="Open"
          style={COLOR.deepPurple}
          size="small"
        >
          <OpenInNewTwoToneIcon onClick={handleOpenClick} />
        </IconButton>
      </Box>
    </Box>
  );
});

export default BookmarkRow;
