import { Box, IconButton, TextField } from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import DoneAllTwoToneIcon from "@material-ui/icons/DoneAllTwoTone";
import RestoreTwoToneIcon from "@material-ui/icons/RestoreTwoTone";
import React, { memo, useState } from "react";
import { COLOR } from "../constants/color";

const getBgColor = (newValue, oldValue) =>
  newValue !== oldValue ? "antiquewhite" : undefined;

export const RedirectionRule = memo(
  ({ redirection, pos, handleRemoveRule, handleSaveRule }) => {
    const [website, setWebsite] = useState(redirection[0]);
    const [redirectionValue, setRedirectionValue] = useState(redirection[1]);

    const onWebsiteInput = (event) => {
      setWebsite(event.target.value.trim());
    };

    const onRedirectionValueInput = (event) => {
      setRedirectionValue(event.target.value.trim());
    };

    const handleResetClick = () => {
      setWebsite(redirection[0]);
      setRedirectionValue(redirection[1]);
    };

    const handleRemoveClick = () => {
      handleRemoveRule(pos);
    };

    const handleSaveClick = () => {
      handleSaveRule([website, redirectionValue], pos);
    };

    return (
      <Box display="flex" alignItems="center">
        <Box
          marginRight="8px"
          display="inline-block"
          bgcolor={getBgColor(redirection[0], website)}
        >
          <TextField
            id="alias"
            value={website}
            onChange={onWebsiteInput}
          />
        </Box>
        <Box
          display="inline-block"
          bgcolor={getBgColor(redirection[1], redirectionValue)}
        >
          <TextField
            id="redirectionValue"
            value={redirectionValue}
            onChange={onRedirectionValueInput}
          />
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
