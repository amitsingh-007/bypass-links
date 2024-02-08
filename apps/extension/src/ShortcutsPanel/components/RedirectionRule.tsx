import { IRedirection } from '@bypass/shared';
import { useSortable } from '@dnd-kit/sortable';
import { ActionIcon, Center, Checkbox, Group, TextInput } from '@mantine/core';
import { CgWebsite } from '@react-icons/all-files/cg/CgWebsite';
import { IoSave } from '@react-icons/all-files/io5/IoSave';
import { MdOutlineDelete } from '@react-icons/all-files/md/MdOutlineDelete';
import { MdShortcut } from '@react-icons/all-files/md/MdShortcut';
import { RxDragHandleDots2 } from '@react-icons/all-files/rx/RxDragHandleDots2';
import { RxExternalLink } from '@react-icons/all-files/rx/RxExternalLink';
import useHistoryStore from '@store/history';
import clsx from 'clsx';
import { memo, useState } from 'react';
import { DEFAULT_RULE_ALIAS } from '../constants';
import styles from './styles/RedirectionRule.module.css';

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
      <ActionIcon c="white" radius="xl" size="lg" {...dndAttrs}>
        <RxDragHandleDots2 size={20} />
      </ActionIcon>
      <Group className={styles.group}>
        <TextInput
          w="35%"
          placeholder="Enter Alias"
          value={ruleAlias}
          onChange={(e) => setRuleAlias(e.target.value.trim())}
          leftSection={<MdShortcut />}
          error={!ruleAlias}
        />
        <TextInput
          w="60%"
          placeholder="Enter Website"
          value={ruleWebsite}
          onChange={(e) => setRuleWebsite(e.target.value.trim())}
          leftSection={<CgWebsite />}
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
        radius="xl"
        size="lg"
        disabled={!ruleWebsite}
        onClick={handleLinkOpen}
        color="blue.5"
        className={clsx({
          [styles.disabled]: !ruleWebsite,
        })}
      >
        <RxExternalLink size={21} />
      </ActionIcon>
      <ActionIcon
        radius="xl"
        size="lg"
        disabled={isRuleSaveActive}
        onClick={handleSaveClick}
        color="teal"
        className={clsx({
          [styles.disabled]: isRuleSaveActive,
        })}
      >
        <IoSave size={18} />
      </ActionIcon>
      <ActionIcon radius="xl" size="lg" onClick={handleRemoveClick} color="red">
        <MdOutlineDelete size={21} />
      </ActionIcon>
    </Center>
  );
});

export default RedirectionRule;
