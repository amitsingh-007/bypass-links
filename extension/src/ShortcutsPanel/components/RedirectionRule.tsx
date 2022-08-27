import { Box, Checkbox, IconButton, TextField } from '@mui/material';
import tabs from 'GlobalHelpers/chrome/tabs';
import { memo, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FiExternalLink } from 'react-icons/fi';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { MdDragHandle } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { IRedirection } from 'SrcPath/BackgroundScript/interfaces/redirections';
import { startHistoryMonitor } from 'SrcPath/HistoryPanel/actionCreators';
import { DEFAULT_RULE_ALIAS } from '../constants';

const inputProps = {
  style: {
    fontSize: '15px',
    padding: '4px 12px',
  },
};

type Props = IRedirection & {
  pos: number;
  handleRemoveRule: (pos: number) => void;
  handleSaveRule: (redirection: IRedirection, pos: number) => void;
};

const RedirectionRule = memo(function RedirectionRule({
  alias,
  website,
  isDefault,
  pos,
  handleRemoveRule,
  handleSaveRule,
}: Props) {
  const dispatch = useDispatch();
  const [ruleAlias, setRuleAlias] = useState(alias);
  const [ruleWebsite, setRuleWebsite] = useState(website);
  const [isDefaultRule, setIsDefaultRule] = useState(isDefault);

  const onWebsiteAliasInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRuleAlias(event.target.value.trim());
  };
  const onWebsiteInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRuleWebsite(event.target.value.trim());
  };

  const handleDefaultRuleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDefaultRule(event.target.checked);
  };
  const handleRemoveClick = () => {
    handleRemoveRule(pos);
  };
  const handleSaveClick = () => {
    handleSaveRule(
      {
        alias: ruleAlias,
        website: ruleWebsite,
        isDefault: isDefaultRule,
      },
      pos
    );
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
    <Draggable draggableId={`${alias}_${website}`} index={pos}>
      {(provided) => (
        <Box
          {...provided.draggableProps}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <IconButton
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            title="Drag"
            edge="start"
            color="secondary"
          >
            <MdDragHandle />
          </IconButton>
          <Checkbox
            checked={isDefaultRule}
            onChange={handleDefaultRuleChange}
            color="primary"
          />
          <TextField
            id={alias}
            value={ruleAlias}
            onChange={onWebsiteAliasInput}
            size="small"
            placeholder="Enter Alias"
            sx={{ marginRight: '8px' }}
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
            title="Open"
            edge="end"
            color="info"
            disabled={!ruleWebsite}
            onClick={handleLinkOpen}
          >
            <FiExternalLink />
          </IconButton>
          <IconButton
            title="Save"
            color="success"
            edge="end"
            disabled={isRuleSaveActive}
            onClick={handleSaveClick}
          >
            <IoCheckmarkDoneSharp />
          </IconButton>
          <IconButton title="Delete" color="error" onClick={handleRemoveClick}>
            <MdRemoveCircleOutline />
          </IconButton>
        </Box>
      )}
    </Draggable>
  );
});

export default RedirectionRule;
