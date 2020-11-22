import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from "@material-ui/icons/Done";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import React, { useEffect, useState } from "react";

const Redirection = ({
  redirection,
  pos,
  handleRemoveRule,
  handleSaveRule,
}) => {
  const [website, setWebsite] = useState(redirection[0]);
  const [redirectionValue, setRedirectionValue] = useState(redirection[1]);

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
    <Box marginTop="8px">
      <Box
        marginRight="8px"
        display="inline-block"
        bgcolor={redirection[0] !== website ? "antiquewhite" : undefined}
      >
        <TextField
          id="alias"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value.trim());
          }}
        />
      </Box>
      <Box
        display="inline-block"
        bgcolor={
          redirection[1] !== redirectionValue ? "antiquewhite" : undefined
        }
      >
        <TextField
          id="redirectionValue"
          value={redirectionValue}
          onChange={(e) => {
            setRedirectionValue(e.target.value.trim());
          }}
        />
      </Box>
      <Box display="inline-block">
        <IconButton color="primary" aria-label="Reset">
          <RotateLeftIcon onClick={handleResetClick} />
        </IconButton>
        <IconButton aria-label="Save">
          <DoneIcon htmlColor="green" onClick={handleSaveClick} />
        </IconButton>
        <IconButton aria-label="Remove">
          <DeleteIcon htmlColor="red" onClick={handleRemoveClick} />
        </IconButton>
      </Box>
    </Box>
  );
};

export const EditPanel = ({ setShowEditPanel }) => {
  const [redirections, setRedirections] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { getRedirections: true },
      ({ redirections }) => {
        const modifiedRedirections = Object.entries(
          redirections
        ).map(([key, value]) => [atob(key), atob(value)]);
        setRedirections(modifiedRedirections);
        setIsFetching(false);
      }
    );
  }, []);

  const handleClose = () => {
    setShowEditPanel(false);
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
    <Box
      width="max-content"
      display="flex"
      flexDirection="column"
      paddingTop="20px"
      paddingLeft="12px"
      paddingBottom="12px"
    >
      <Box marginBottom="12px">
        <Box display="inline-block" marginRight="8px">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={handleClose}
          >
            <Box component="span" fontWeight="bold">
              Discard
            </Box>
          </Button>
        </Box>
        <Box display="inline-block" marginRight="8px">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CheckCircleIcon />}
            onClick={handleSave}
          >
            <Box component="span" fontWeight="bold">
              Save
            </Box>
          </Button>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddRule}
        >
          <Box component="span" fontWeight="bold">
            Add Rule
          </Box>
        </Button>
      </Box>
      {isFetching ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="secondary" size={55} />
        </Box>
      ) : null}
      {!isFetching && redirections && redirections.length > 0 ? (
        <form noValidate autoComplete="off">
          {redirections.map((redirection, index) => (
            <Redirection
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
