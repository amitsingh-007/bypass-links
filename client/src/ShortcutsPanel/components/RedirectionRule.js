import { Box, Checkbox, IconButton, TextField } from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import DoneAllTwoToneIcon from "@material-ui/icons/DoneAllTwoTone";
import DragHandleTwoToneIcon from "@material-ui/icons/DragHandleTwoTone";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { DEFAULT_RULE_ALIAS } from "../constants";

const inputProps = {
  style: {
    fontSize: "15px",
    padding: "4px 12px",
  },
};

const RedirectionRule = memo(
  ({
    alias,
    website,
    isDefault,
    pos,
    handleRemoveRule,
    handleSaveRule,
    index,
  }) => {
    const dispatch = useDispatch();
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
    const handleRemoveClick = () => {
      handleRemoveRule(pos);
    };
    const handleSaveClick = () => {
      handleSaveRule(ruleAlias, ruleWebsite, isDefaultRule, pos);
    };
    const handleLinkOpen = () => {
      dispatch(startHistoryMonitor());
      tabs.create({ url: ruleWebsite, selected: false });
    };

    const issameRule =
      alias === ruleAlias &&
      website === ruleWebsite &&
      isDefault === isDefaultRule;
    const isRuleSaveActive = issameRule || ruleAlias === DEFAULT_RULE_ALIAS;

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
            <TextField
              id={alias}
              value={ruleAlias}
              onChange={onWebsiteAliasInput}
              size="small"
              placeholder="Enter Alias"
              sx={{ marginRight: "8px" }}
              inputProps={inputProps}
              autoFocus={ruleAlias === DEFAULT_RULE_ALIAS}
            />
            <TextField
              id={ruleWebsite}
              value={ruleWebsite}
              onChange={onWebsiteInput}
              fullWidth
              size="small"
              placeholder="Enter Website"
              inputProps={inputProps}
            />
            <IconButton
              aria-label="Open"
              title="Open"
              style={getActiveDisabledColor(ruleWebsite, COLOR.deepPurple)}
              edge="end"
              disabled={!ruleWebsite}
              onClick={handleLinkOpen}
            >
              <OpenInNewTwoToneIcon />
            </IconButton>
            <IconButton
              aria-label="Save"
              title="Save"
              style={getActiveDisabledColor(!isRuleSaveActive, COLOR.green)}
              edge="end"
              disabled={isRuleSaveActive}
              onClick={handleSaveClick}
            >
              <DoneAllTwoToneIcon />
            </IconButton>
            <IconButton
              aria-label="Remove"
              title="Delete"
              style={COLOR.red}
              onClick={handleRemoveClick}
            >
              <DeleteTwoToneIcon />
            </IconButton>
          </Box>
        )}
      </Draggable>
    );
  }
);

export default RedirectionRule;
