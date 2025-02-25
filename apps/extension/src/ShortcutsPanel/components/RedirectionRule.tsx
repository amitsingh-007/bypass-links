import { getlastVisitedText } from '@/utils/lastVisited';
import { IRedirection } from '@bypass/shared';
import {
  ActionIcon,
  Center,
  Checkbox,
  Flex,
  Group,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import useHistoryStore from '@store/history';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { CgWebsite } from 'react-icons/cg';
import { FaCalendarCheck } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';
import { MdOutlineDelete, MdShortcut } from 'react-icons/md';
import { RxExternalLink } from 'react-icons/rx';
import { DEFAULT_RULE_ALIAS } from '../constants';
import styles from './styles/RedirectionRule.module.css';
import { ReorderButton } from './ReorderButton';

type Props = IRedirection & {
  pos: number;
  total: number;
  highlight: boolean;
  handleRemoveRule: (pos: number) => void;
  handleSaveRule: (redirection: IRedirection, pos: number) => void;
  handleRuleMoveUp: (pos: number) => void;
  handleRuleMoveDown: (pos: number) => void;
};

const RedirectionRule = ({
  alias,
  website,
  isDefault,
  pos,
  total,
  highlight,
  handleRemoveRule,
  handleSaveRule,
  handleRuleMoveUp,
  handleRuleMoveDown,
}: Props) => {
  const theme = useMantineTheme();
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const [ruleAlias, setRuleAlias] = useState(alias);
  const [ruleWebsite, setRuleWebsite] = useState(website);
  const [isDefaultRule, setIsDefaultRule] = useState(isDefault);
  const [lastVisited, setLastVisited] = useState<string>();

  useEffect(() => {
    const initLastVisited = async () => {
      const lastVisitedText = await getlastVisitedText(website);
      setLastVisited(lastVisitedText);
    };
    initLastVisited();
  }, [website]);

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

  return (
    <Center>
      <ReorderButton
        pos={pos}
        total={total}
        handleRuleMoveUp={handleRuleMoveUp}
        handleRuleMoveDown={handleRuleMoveDown}
      />
      <Group className={styles.group}>
        <TextInput
          w="35%"
          placeholder="Enter Alias"
          value={ruleAlias}
          onChange={(e) => setRuleAlias(e.target.value.trim())}
          leftSection={<MdShortcut />}
          error={!ruleAlias}
          classNames={{ input: highlight ? styles.highlight : undefined }}
        />
        <TextInput
          w="60%"
          placeholder="Enter Website"
          value={ruleWebsite}
          onChange={(e) => setRuleWebsite(e.target.value.trim())}
          leftSection={<CgWebsite />}
          rightSection={
            lastVisited ? (
              <Tooltip
                label={<Text>{lastVisited}</Text>}
                withArrow
                radius="md"
                color="gray"
              >
                <Flex>
                  <FaCalendarCheck color={theme.colors.teal[5]} />
                </Flex>
              </Tooltip>
            ) : null
          }
          error={!ruleWebsite}
          classNames={{ input: highlight ? styles.highlight : undefined }}
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
};

export default RedirectionRule;
