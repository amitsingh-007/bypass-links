import { Box, IconButton, makeStyles, TextField } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import runtime from "ChromeApi/runtime";
import { hideQuickBookmarkPanel } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PanelHeading from "./PanelHeading";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
}));

const QuickBookmarkPanel = memo(() => {
  const dispatch = useDispatch();
  const { bookmark } = useSelector((state) => state.showQuickBookmarkPanel);
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleClose = () => {
    dispatch(hideQuickBookmarkPanel());
  };

  const handleSave = () => {
    runtime
      .sendMessage({
        addBookmark: { url: btoa(url), title: btoa(title) },
      })
      .then(({ isBookmarkAdded }) => {
        if (isBookmarkAdded) {
          handleClose();
        }
      });
  };

  const handleRemove = () => {
    runtime
      .sendMessage({ removeBookmark: true })
      .then(({ isBookmarkRemoved }) => {
        if (isBookmarkRemoved) {
          handleClose();
        }
      });
  };

  const classes = useStyles();
  return (
    <Box width="600px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          aria-label="Back"
          component="span"
          style={COLOR.blue}
          onClick={handleClose}
          title="Back"
        >
          <ArrowBackTwoToneIcon fontSize="large" />
        </IconButton>
        <PanelHeading heading="QUICK BOOKMARK PANEL" />
      </Box>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        className={classes.root}
        display="flex"
        flexDirection="column"
        paddingX="12px"
      >
        <TextField
          label="Title"
          variant="filled"
          value={title}
          onChange={handleTitleChange}
          size="small"
          color="secondary"
          title={title}
        />
        <TextField
          label="Url"
          variant="filled"
          value={url}
          onChange={handleUrlChange}
          size="small"
          color="secondary"
          title={url}
          InputProps={{ readOnly: true }}
        />
      </Box>
      <Box display="flex" justifyContent="center" paddingX="12px">
        <IconButton
          aria-label="Save"
          component="span"
          style={COLOR.green}
          onClick={handleSave}
          title="Save"
        >
          <SaveTwoToneIcon fontSize="large" />
        </IconButton>
        {bookmark.isBookmarked ? (
          <IconButton
            aria-label="Remove"
            component="span"
            style={COLOR.red}
            onClick={handleRemove}
            title="Clear"
          >
            <DeleteTwoToneIcon fontSize="large" />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
});

export default QuickBookmarkPanel;
