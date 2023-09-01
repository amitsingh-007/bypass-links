import { IRedirection } from '@/BackgroundScript/interfaces/redirections';
import { useSortable } from '@dnd-kit/sortable';
import {
  ActionIcon,
  Center,
  Checkbox,
  Group,
  Sx,
  TextInput,
} from '@mantine/core';
import useHistoryStore from '@store/history';
import { memo, useState } from 'react';
import { CgWebsite } from 'react-icons/cg';
import { GiSaveArrow } from 'react-icons/gi';
import { MdOutlineDelete, MdShortcut } from 'react-icons/md';
import { RxDragHandleDots2, RxExternalLink } from 'react-icons/rx';
import { DEFAULT_RULE_ALIAS } from '../constants';

const disabledStyles: Sx = {
  border: 'unset !important',
  backgroundColor: 'unset !important',
};

type Props = IRedirection & {
  pos: number;
  handleRemoveRule: (pos: number) => void;
  handleSaveRule: (redirection: IRedirection, pos: number) => void;
  dndProps?: Pick<
    ReturnType<typeof useSortable>,
    'listeners' | 'setNodeRef' | 'attributes'
  >;
};

const RedirectionRule = memo(function RedirectionRule({
  alias,
  website,
  isDefault,
  pos,
  handleRemoveRule,
  handleSaveRule,
  dndProps,
}: Props) {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const [ruleAlias, setRuleAlias] = useState(alias);
  const [ruleWebsite, setRuleWebsite] = useState(website);
  const [isDefaultRule, setIsDefaultRule] = useState(isDefault);

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
    startHistoryMonitor();
    chrome.tabs.create({ url: ruleWebsite, active: false });
  };

  const isSameRule =
    alias === ruleAlias &&
    website === ruleWebsite &&
    isDefault === isDefaultRule;
  const isRuleSaveActive = isSameRule || ruleAlias === DEFAULT_RULE_ALIAS;

  const dndAttrs = dndProps
    ? {
        ...dndProps.listeners,
        ...dndProps.attributes,
        ref: dndProps.setNodeRef,
      }
    : {};

  return (
    <Center>
      <ActionIcon radius={999} size="lg" {...dndAttrs}>
        <RxDragHandleDots2 size={20} />
      </ActionIcon>
      <Group sx={{ flex: 1 }}>
        <TextInput
          w="35%"
          placeholder="Enter Alias"
          value={ruleAlias}
          onChange={(e) => setRuleAlias(e.target.value.trim())}
          icon={<MdShortcut />}
          error={!ruleAlias}
        />
        <TextInput
          w="60%"
          placeholder="Enter Website"
          value={ruleWebsite}
          onChange={(e) => setRuleWebsite(e.target.value.trim())}
          icon={<CgWebsite />}
          error={!ruleWebsite}
        />
      </Group>
      <Checkbox
        checked={isDefaultRule}
        onChange={(e) => setIsDefaultRule(e.target.checked)}
        mr={2}
        display="flex"
      />
      <ActionIcon
        radius={999}
        size="lg"
        disabled={!ruleWebsite}
        onClick={handleLinkOpen}
        color="blue.5"
        sx={ruleWebsite ? undefined : disabledStyles}
      >
        <RxExternalLink size={21} />
      </ActionIcon>
      <ActionIcon
        radius={999}
        size="lg"
        disabled={isRuleSaveActive}
        onClick={handleSaveClick}
        color="teal"
        sx={isRuleSaveActive ? disabledStyles : undefined}
      >
        <GiSaveArrow size={20} />
      </ActionIcon>
      <ActionIcon
        radius={999}
        size="lg"
        onClick={handleRemoveClick}
        color="red"
      >
        <MdOutlineDelete size={21} />
      </ActionIcon>
    </Center>
  );
});

export default RedirectionRule;
