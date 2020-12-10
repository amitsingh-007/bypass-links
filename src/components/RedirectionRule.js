import { Box, IconButton, Input, makeStyles } from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import DoneAllTwoToneIcon from "@material-ui/icons/DoneAllTwoTone";
import RestoreTwoToneIcon from "@material-ui/icons/RestoreTwoTone";
import { COLOR } from "GlobalConstants/color";
import React, { memo, useState } from "react";

const useStyles = makeStyles({
  input: { fontSize: "15px" },
});

const getBgColor = (newValue, oldValue) =>
  newValue !== oldValue ? "antiquewhite" : undefined;

export const RedirectionRule = memo(
  ({ redirection, pos, handleRemoveRule, handleSaveRule }) => {
    const [websiteAlias, setWebsiteAlias] = useState(redirection[0]);
    const [website, setWebsite] = useState(redirection[1]);

    const onWebsiteAliasInput = (event) => {
      setWebsiteAlias(event.target.value.trim());
    };

    const onWebsiteInput = (event) => {
      setWebsite(event.target.value.trim());
    };

    const handleResetClick = () => {
      setWebsiteAlias(redirection[0]);
      setWebsite(redirection[1]);
    };

    const handleRemoveClick = () => {
      handleRemoveRule(pos);
    };

    const handleSaveClick = () => {
      handleSaveRule([websiteAlias, website], pos);
    };

    const classes = useStyles();

    return (
      <Box display="flex" alignItems="center">
        <Box display="flex">
          <Box
            marginRight="8px"
            display="inline-block"
            bgcolor={getBgColor(redirection[0], websiteAlias)}
            width="30%"
          >
            <Input
              id="alias"
              value={websiteAlias}
              onChange={onWebsiteAliasInput}
              size="small"
              fullWidth
              placeholder="Enter Alias"
              classes={{ input: classes.input }}
            />
          </Box>
          <Box
            display="inline-block"
            bgcolor={getBgColor(redirection[1], website)}
            flexGrow={1}
          >
            <Input
              id="redirectionValue"
              value={website}
              onChange={onWebsiteInput}
              size="small"
              fullWidth
              placeholder="Enter Website"
              classes={{ input: classes.input }}
            />
          </Box>
        </Box>
        <Box display="inline-block">
          <IconButton
            color="primary"
            aria-label="Reset"
            title="Reset"
            edge="end"
          >
            <RestoreTwoToneIcon onClick={handleResetClick} />
          </IconButton>
          <IconButton
            aria-label="Save"
            title="Save"
            style={COLOR.green}
            edge="end"
          >
            <DoneAllTwoToneIcon onClick={handleSaveClick} />
          </IconButton>
          <IconButton aria-label="Remove" title="Delete" style={COLOR.red}>
            <DeleteTwoToneIcon htmlColor="red" onClick={handleRemoveClick} />
          </IconButton>
        </Box>
      </Box>
    );
  }
);
