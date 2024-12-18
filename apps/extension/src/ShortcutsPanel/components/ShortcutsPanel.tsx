import { trpcApi } from '@/apis/trpcApi';
import { syncRedirectionsToStorage } from '@/BackgroundScript/redirect';
import { MAX_PANEL_SIZE } from '@/constants';
import { Header, IRedirection, IRedirections } from '@bypass/shared';
import { getRedirections } from '@helpers/fetchFromStorage';
import { Box, Button, Flex, LoadingOverlay } from '@mantine/core';
import useToastStore from '@store/toast';
import { memo, useEffect, useState } from 'react';
import { IoSave } from 'react-icons/io5';
import { RiPlayListAddFill } from 'react-icons/ri';
import { DEFAULT_RULE_ALIAS } from '../constants';
import { getValidRules } from '../utils';
import styles from './styles/ShortcutsPanel.module.css';
import RedirectionRule from './RedirectionRule';

const ShortcutsPanel = memo(function ShortcutsPanel() {
  const displayToast = useToastStore((state) => state.displayToast);
  const [redirections, setRedirections] = useState<IRedirections>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaveActive, setIsSaveActive] = useState(false);

  useEffect(() => {
    getRedirections().then((_redirections) => {
      const modifiedRedirections = Object.entries(_redirections).map(
        ([_key, { alias, website, isDefault }]) =>
          ({
            alias: atob(alias),
            website: atob(website),
            isDefault,
          }) satisfies IRedirection
      );
      setRedirections(modifiedRedirections);
      setIsFetching(false);
    });
  }, []);

  const saveRedirectionTemp = (newRedirections: IRedirections) => {
    setRedirections(newRedirections);
    setIsSaveActive(true);
  };

  const handleSave = async () => {
    setIsFetching(true);
    const validRules = redirections.filter((x) => getValidRules(x));
    const isSaveSuccess =
      await trpcApi.firebaseData.redirectionsPost.mutate(validRules);
    if (isSaveSuccess) {
      syncRedirectionsToStorage();
      setRedirections(validRules);
      displayToast({
        message: 'Saved successfully',
        duration: 1500,
      });
    }
    setIsSaveActive(false);
    setIsFetching(false);
  };

  const handleAddRule = () => {
    redirections.unshift({
      alias: DEFAULT_RULE_ALIAS,
      website: '',
      isDefault: false,
    });
    saveRedirectionTemp([...redirections]);
  };

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    saveRedirectionTemp(newRedirections);
  };

  const handleSaveRule = (redirection: IRedirection, pos: number) => {
    redirections[pos] = redirection;
    saveRedirectionTemp([...redirections]);
  };

  return (
    <Flex w={MAX_PANEL_SIZE.WIDTH} h={MAX_PANEL_SIZE.HEIGHT} direction="column">
      <Header text="Shortcuts">
        <Button
          leftSection={<RiPlayListAddFill />}
          onClick={handleAddRule}
          radius="xl"
          disabled={isFetching}
        >
          Add
        </Button>
        <Button
          leftSection={<IoSave />}
          onClick={handleSave}
          color="teal"
          radius="xl"
          loading={isFetching}
          disabled={!isSaveActive}
        >
          Save
        </Button>
      </Header>
      <Flex
        direction="column"
        gap={10}
        p="0.625rem 0.25rem 0.25rem"
        className={styles.redirectionWrapper}
      >
        {redirections?.map((redirection, index) => (
          <Box key={`${redirection.alias}_${redirection.website}`} tabIndex={0}>
            <RedirectionRule
              {...redirection}
              pos={index}
              handleRemoveRule={handleRemoveRule}
              handleSaveRule={handleSaveRule}
            />
          </Box>
        ))}
        <LoadingOverlay visible={isFetching} />
      </Flex>
    </Flex>
  );
});

export default ShortcutsPanel;
