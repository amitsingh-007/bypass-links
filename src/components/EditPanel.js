import { Box, CircularProgress, IconButton } from "@material-ui/core";
import BackspaceTwoToneIcon from "@material-ui/icons/BackspaceTwoTone";
import PlaylistAddTwoToneIcon from "@material-ui/icons/PlaylistAddTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { hideEditPanel } from "../actionCreator";
import { COLOR } from "../constants/color";
import { RedirectionRule } from "./RedirectionRule";

export const EditPanel = () => {
  const dispatch = useDispatch();
  const [redirections, setRedirections] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { getRedirections: true },
      ({ redirections }) => {
        const modifiedRedirections = Object.entries(
          redirections
        ).map(([key, value]) => [atob(key), atob(value)]);
        // ).map(([key, value]) => [key, value]);
        setRedirections(modifiedRedirections);
        setIsFetching(false);
      }
    );
  }, []);

  const handleClose = () => {
    dispatch(hideEditPanel());
  };

  const handleSave = () => {
    console.log("Saving these redirection rules to Firebase", redirections);
    const redirectionsObj = redirections.reduce((obj, [k, v]) => {
      if (k && v) {
        obj[btoa(k)] = btoa(v);
      }
      return obj;
    }, {});
    chrome.runtime.sendMessage(
      { saveRedirectionRules: redirectionsObj },
      ({ isRuleSaveSuccess }) => {
        if (isRuleSaveSuccess) {
          handleClose();
        }
      }
    );
  };

  const handleAddRule = () => {
    redirections.unshift(["", ""]);
    setRedirections([...redirections]);
  };

  const handleRemoveRule = (pos) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    setRedirections(newRedirections);
  };

  const handleSaveRule = (newRedirection, pos) => {
    redirections[pos] = newRedirection;
    setRedirections([...redirections]);
  };

  return (
    <Box width="max-content" display="flex" flexDirection="column">
      <Box>
        <IconButton
          aria-label="Discard"
          component="span"
          style={COLOR.red}
          onClick={handleClose}
          title="Discard and Close"
        >
          <BackspaceTwoToneIcon fontSize="large" />
        </IconButton>
        <IconButton
          aria-label="Save"
          component="span"
          style={COLOR.green}
          onClick={handleSave}
          title="Save and Close"
        >
          <SaveTwoToneIcon fontSize="large" />
        </IconButton>
        <IconButton
          aria-label="Add"
          component="span"
          color="primary"
          onClick={handleAddRule}
          title="Add Rule"
        >
          <PlaylistAddTwoToneIcon fontSize="large" />
        </IconButton>
      </Box>
      {isFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          width="540px"
          marginBottom="12px"
        >
          <CircularProgress color="secondary" size={55} />
        </Box>
      ) : null}
      {!isFetching && redirections && redirections.length > 0 ? (
        <form noValidate autoComplete="off" style={{ paddingLeft: "12px" }}>
          {redirections.map((redirection, index) => (
            <RedirectionRule
              key={`${redirection[0]}_${redirection[1]}`}
              redirection={redirection}
              pos={index}
              handleRemoveRule={handleRemoveRule}
              handleSaveRule={handleSaveRule}
            />
          ))}
        </form>
      ) : null}
    </Box>
  );
};
