import { Box, Checkbox, IconButton, TextField } from "@material-ui/core";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import DoneAllTwoToneIcon from "@material-ui/icons/DoneAllTwoTone";
import DragHandleTwoToneIcon from "@material-ui/icons/DragHandleTwoTone";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import { COLOR } from "GlobalConstants/color";
import tabs from "GlobalHelpers/chrome/tabs";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";
import { DEFAULT_RULE_ALIAS } from "../constants";
import { Shortcut } from "../interfaces/shortcuts";

const inputProps = {
  style: {
    fontSize: "15px",
    padding: "4px 12px",
  },
};

type Props = Shortcut & {
  pos: number;
  handleRemoveRule: (pos: number) => void;
  handleSaveRule: (redirection: Shortcut, pos: number) => void;
};

const RedirectionRule = memo(function RedirectionRule({
  alias,
  url,
  isPinned,
  pos,
  handleRemoveRule,
  handleSaveRule,
}: Props) {
  const dispatch = useDispatch();
  const [ruleAlias, setRuleAlias] = useState(alias);
  const [ruleUrl, setRuleUrl] = useState(url);
  const [isPinnedRule, setIsPinnedRule] = useState(isPinned);

  const onUrlAliasInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRuleAlias(event.target.value.trim());
  };
  const onUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRuleUrl(event.target.value.trim());
  };

  const handlePinnedStateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsPinnedRule(event.target.checked);
  };
  const handleRemoveClick = () => {
    handleRemoveRule(pos);
  };
  const handleSaveClick = () => {
    handleSaveRule(
      {
        alias: ruleAlias,
        url: ruleUrl,
        isPinned: isPinnedRule,
      },
      pos
    );
  };
  const handleLinkOpen = () => {
    dispatch(startHistoryMonitor());
    tabs.create({ url: ruleUrl, selected: false });
  };

  const issameRule =
    alias === ruleAlias && url === ruleUrl && isPinned === isPinnedRule;
  const isRuleSaveActive = issameRule || ruleAlias === DEFAULT_RULE_ALIAS;

  return (
    <Draggable draggableId={`${alias}_${url}`} index={pos}>
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
            checked={isPinnedRule}
            onChange={handlePinnedStateChange}
            style={COLOR.pink}
          />
          <TextField
            id={alias}
            value={ruleAlias}
            onChange={onUrlAliasInput}
            size="small"
            placeholder="Enter Alias"
            sx={{ marginRight: "8px" }}
            inputProps={inputProps}
            autoFocus={ruleAlias === DEFAULT_RULE_ALIAS}
          />
          <TextField
            id={ruleUrl}
            value={ruleUrl}
            onChange={onUrlInput}
            fullWidth
            size="small"
            placeholder="Enter Url"
            inputProps={inputProps}
          />
          <IconButton
            aria-label="Open"
            title="Open"
            style={getActiveDisabledColor(!!ruleUrl, COLOR.deepPurple)}
            edge="end"
            disabled={!ruleUrl}
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
});

export default RedirectionRule;
