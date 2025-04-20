import { Flex, Text } from '@mantine/core';
import Authenticate from '../components/Authenticate';
import BookmarksPanelButton from '../components/BookmarksPanelButton';
import LastVisitedButton from '../components/LastVisitedButton';
import OpenDefaultsButton from '../components/OpenDefaultsButton';
import OpenForumLinks from '../components/OpenForumLinks';
import PersonsPanelButton from '../components/PersonsPanelButton';
import QuickBookmarkButton from '../components/QuickBookmarkButton';
import ShortcutsPanelButton from '../components/ShortcutsPanelButton';
import ToggleExtension from '../components/ToggleExtension';
import ToggleHistory from '../components/ToggleHistory';
import TwoFactorAuthenticate from '../components/TwoFactorAuthenticate';
import UserProfile from '../components/UserProfile';
import styles from './styles/PopupHome.module.css';
import useExtensionOutdated from '../hooks/useExtensionOutdated';

const handleOpenAsPage = () => {
  chrome.tabs.create({ url: window.location.href });
};

const PopupHome = () => {
  useExtensionOutdated();

  return (
    <>
      <Flex direction="column" align="center" w={305} p="0.5rem 1rem 1rem">
        <Text
          fz="xl"
          fw={700}
          c="grape.1"
          mb="0.625rem"
          className={styles.heading}
          onClick={handleOpenAsPage}
        >
          Bypass Links
        </Text>
        <Flex justify="space-between" align="center" gap="2.5rem" mb="1rem">
          <Flex direction="column" gap="0.5rem">
            <ToggleExtension />
            <ToggleHistory />
          </Flex>
          <UserProfile />
        </Flex>
        <Flex className={styles.buttonsContainer}>
          <Authenticate />
          <OpenDefaultsButton />
          <QuickBookmarkButton />
          <PersonsPanelButton />
          <BookmarksPanelButton />
          <ShortcutsPanelButton />
          <OpenForumLinks />
          <LastVisitedButton />
        </Flex>
      </Flex>
      <TwoFactorAuthenticate />
    </>
  );
};

export default PopupHome;
