import { Box, Grid, Text } from '@mantine/core';
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <ToggleExtension />
            <ToggleHistory />
          </Box>
          <UserProfile />
        </Box>
        <Grid gutter="lg" sx={{ marginTop: '10px' }}>
          <Grid.Col span={4}>
            <Authenticate />
          </Grid.Col>
          <Grid.Col span={4}>
            <ShortcutsPanelButton />
          </Grid.Col>
          <Grid.Col span={4}>
            <BookmarksPanelButton />
          </Grid.Col>
          <Grid.Col span={4}>
            <HistoryPanelButton />
          </Grid.Col>
          <Grid.Col span={4}>
            <OpenDefaultsButton />
          </Grid.Col>
          <Grid.Col span={4}>
            <QuickBookmarkButton />
          </Grid.Col>
          <Grid.Col span={4}>
            <OpenForumLinks />
          </Grid.Col>
          <Grid.Col span={4}>
            <LastVisitedButton />
          </Grid.Col>
          <Grid.Col span={4}>
            <PersonsPanelButton />
          </Grid.Col>
        </Grid>
      </Box>
      <TwoFactorAuthenticate />
    </>
  );
});

export default PopupHome;
