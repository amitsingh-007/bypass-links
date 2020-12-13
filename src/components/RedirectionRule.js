import {
  Box,
  Checkbox,
  IconButton,
  Input,
  makeStyles,
} from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import DoneAllTwoToneIcon from "@material-ui/icons/DoneAllTwoTone";
import RestoreTwoToneIcon from "@material-ui/icons/RestoreTwoTone";
import { COLOR } from "GlobalConstants/color";
import React, { memo, useState } from "react";

const useStyles = makeStyles({
  input: { fontSize: "15px" },
});

export const RedirectionRule = memo(
  ({ alias, website, isDefault, pos, handleRemoveRule, handleSaveRule }) => {
    const [ruleAlias, setRuleAlias] = useState(alias);
    const [ruleWebsite, setRuleWebsite] = useState(website);
    const [isDefaultRule, setIsDefaultRule] = useState(isDefault);

    const onWebsiteAliasInput = (event) => {
      setRuleAlias(event.target.value.trim());
    };

    const onWebsiteInput = (event) => {
      setRuleWebsite(event.target.value.trim());
    };

    const handleDefaultRuleChange = (event) => {
      setIsDefaultRule(event.target.checked);
    };

    const handleResetClick = () => {
      setRuleAlias(alias);
      setRuleWebsite(website);
    };

    const handleRemoveClick = () => {
      handleRemoveRule(pos);
    };

    const handleSaveClick = () => {
      handleSaveRule(ruleAlias, ruleWebsite, isDefaultRule, pos);
    };

    const classes = useStyles();
    const isRuleSame =
      alias === ruleAlias &&
      website === ruleWebsite &&
      isDefault === isDefaultRule;

    return (
      <Box display="flex" alignItems="center">
        <Box display="flex" alignItems="center">
          <Checkbox
            checked={isDefaultRule}
            onChange={handleDefaultRuleChange}
          />
          <Box marginRight="8px" display="inline-block" width="30%">
            <Input
              id="alias"
              value={ruleAlias}
              onChange={onWebsiteAliasInput}
              size="small"
              fullWidth
              placeholder="Enter Alias"
              classes={{ input: classes.input }}
            />
          </Box>
          <Box display="inline-block" flexGrow={1}>
            <Input
              id="redirectionValue"
              value={ruleWebsite}
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
            style={isRuleSame ? null : COLOR.green}
            edge="end"
            disabled={isRuleSame}
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
