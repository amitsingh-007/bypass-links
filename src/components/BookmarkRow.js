import { Box, IconButton, Input, makeStyles } from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import tabs from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import React, { memo } from "react";

const useStyles = makeStyles({
  input: {
    fontSize: "15px",
    width: "500px",
  },
});

const BookmarkRow = memo(({ url, pos, handleRemoveBookmark }) => {
  const handleRemoveClick = () => {
    handleRemoveBookmark(pos);
  };

  const handleOpenClick = () => {
    tabs.create({ url, selected: false });
  };

  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center">
      <Input
        value={url}
        size="small"
        variant="filled"
        fullWidth
        classes={{ input: classes.input }}
        readOnly
        multiline
        rowsMax={2}
      />
      <IconButton
        edge="end"
        aria-label="Remove"
        title="Delete"
        style={COLOR.red}
      >
        <DeleteTwoToneIcon onClick={handleRemoveClick} />
      </IconButton>
      <IconButton aria-label="Open" title="Open" style={COLOR.deepPurple}>
        <OpenInNewTwoToneIcon onClick={handleOpenClick} />
      </IconButton>
    </Box>
  );
});

export default BookmarkRow;
