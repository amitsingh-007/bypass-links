import { Flex, SimpleGrid, Text } from '@mantine/core';
import { memo } from 'react';
import Authenticate from '../components/Authenticate';
import BookmarksPanelButton from '../components/BookmarksPanelButton';
import HistoryPanelButton from '../components/HistoryPanelButton';
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

const PopupHome = memo(function PopupHome() {
  return (
    <>
      <Flex
        direction="column"
        align="center"
        sx={{
          width: 'fit-content',
          padding: '8px 16px 16px',
        }}
      >
        <Text
          fz="xl"
          fw={700}
          c="grape.0"
          sx={{
            marginBottom: '10px',
            userSelect: 'none',
          }}
        >
          Bypass Links
        </Text>
        <Flex
          justify="space-between"
          align="center"
          gap="40px"
          sx={{ marginBottom: '16px' }}
        >
          <Flex direction="column" gap="8px">
            <ToggleExtension />
            <ToggleHistory />
          </Flex>
          <UserProfile />
        </Flex>
        <Authenticate />
        <SimpleGrid
          cols={2}
          sx={{
            marginTop: '16px',
            width: 'max-content',
          }}
        >
          <OpenDefaultsButton />
          <QuickBookmarkButton />
          <PersonsPanelButton />
          <BookmarksPanelButton />
          <HistoryPanelButton />
          <ShortcutsPanelButton />
          <OpenForumLinks />
          <LastVisitedButton />
        </SimpleGrid>
      </Flex>
      <TwoFactorAuthenticate />
    </>
  );
});

export default PopupHome;
