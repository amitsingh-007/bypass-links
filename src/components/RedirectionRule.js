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
import DragHandleTwoToneIcon from "@material-ui/icons/DragHandleTwoTone";
import { COLOR } from "GlobalConstants/color";
import React, { memo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";

const useStyles = makeStyles({
  input: { fontSize: "15px" },
});

export const RedirectionRule = memo(
  ({
    alias,
    website,
    isDefault,
    pos,
    handleRemoveRule,
    handleSaveRule,
    index,
  }) => {
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
      <Draggable draggableId={`${alias}_${website}`} index={index}>
        {(provided) => (
          <Box
            {...provided.draggableProps}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <IconButton
              ref={provided.innerRef}
              {...provided.dragHandleProps}
              aria-label="Drag"
              title="Drag"
              style={COLOR.blueGrey}
              edge="start"
            >
              <DragHandleTwoToneIcon />
            </IconButton>
            <Checkbox
              checked={isDefaultRule}
              onChange={handleDefaultRuleChange}
              style={COLOR.pink}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  marginRight: "8px",
                  display: "inline-block",
                  width: "30%",
                }}
              >
                <Input
                  id={alias}
                  value={ruleAlias}
                  onChange={onWebsiteAliasInput}
                  size="small"
                  fullWidth
                  placeholder="Enter Alias"
                  classes={{ input: classes.input }}
                />
              </Box>
              <Box sx={{ display: "inline-block", flexGrow: 1 }}>
                <Input
                  id={ruleWebsite}
                  value={ruleWebsite}
                  onChange={onWebsiteInput}
                  size="small"
                  fullWidth
                  placeholder="Enter Website"
                  classes={{ input: classes.input }}
                />
              </Box>
            </Box>
            <IconButton
              style={COLOR.blue}
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
              <DeleteTwoToneIcon onClick={handleRemoveClick} />
            </IconButton>
          </Box>
        )}
      </Draggable>
    );
  }
);
