import { Box, CircularProgress, IconButton } from "@material-ui/core";
import BackspaceTwoToneIcon from "@material-ui/icons/BackspaceTwoTone";
import PlaylistAddTwoToneIcon from "@material-ui/icons/PlaylistAddTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import runtime from "ChromeApi/runtime";
import { hideEditPanel } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PanelHeading from "./PanelHeading";
import { RedirectionRule } from "./RedirectionRule";

export const EditPanel = memo(() => {
  const dispatch = useDispatch();
  const [redirections, setRedirections] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    runtime.sendMessage({ getRedirections: true }).then(({ redirections }) => {
      const modifiedRedirections = Object.entries(redirections).map(
        ([key, { alias, website, isDefault }]) => ({
          alias: atob(alias),
          website: atob(website),
          isDefault,
        })
      );
      setRedirections(modifiedRedirections);
      setIsFetching(false);
    });
  }, []);

  const handleClose = () => {
    dispatch(hideEditPanel());
  };

  const handleSave = () => {
    console.log("Saving these redirection rules to Firebase", redirections);
    let index = 0;
    const redirectionsObj = redirections.reduce(
      (obj, { alias, website, isDefault }) => {
        if (!!alias && !!website) {
          obj[index++] = {
            alias: btoa(alias),
            website: btoa(website),
            isDefault,
          };
        }
        return obj;
      },
      {}
    );
    runtime
      .sendMessage({ saveRedirectionRules: redirectionsObj })
      .then(({ isRuleSaveSuccess }) => {
        if (isRuleSaveSuccess) {
          handleClose();
        }
      });
  };

  const handleAddRule = () => {
    redirections.unshift({
      alias: "",
      website: "",
      isDefault: false,
    });
    setRedirections([...redirections]);
  };

  const handleRemoveRule = (pos) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    setRedirections(newRedirections);
  };

  const handleSaveRule = (alias, website, isDefault, pos) => {
    redirections[pos] = {
      alias,
      website,
      isDefault,
    };
    setRedirections([...redirections]);
  };

  return (
    <Box width="max-content" display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
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
        <PanelHeading heading="REDIRECTION PANEL" />
      </Box>
      {isFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          width="536px"
          marginBottom="12px"
        >
          <CircularProgress color="secondary" size={55} />
        </Box>
      ) : null}
      {!isFetching && redirections && redirections.length > 0 ? (
        <form noValidate autoComplete="off" style={{ paddingLeft: "12px" }}>
          {redirections.map(({ alias, website, isDefault }, index) => (
            <RedirectionRule
              alias={alias}
              website={website}
              isDefault={isDefault}
              key={`${alias}_${website}`}
              pos={index}
              handleRemoveRule={handleRemoveRule}
              handleSaveRule={handleSaveRule}
            />
          ))}
        </form>
      ) : null}
    </Box>
  );
});
