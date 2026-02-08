import { getLastVisited } from '@helpers/fetchFromStorage';
import { sha256Hash, STORAGE_KEYS } from '@bypass/shared';
import { Button, Text, Tooltip } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import useCurrentTab from '@popup/hooks/useCurrentTab';
import { trpcApi } from '@/apis/trpcApi';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { getlastVisitedText } from '@/utils/lastVisited';

function LastVisitedButton() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState('');

  const initLastVisited = useCallback(async () => {
    if (!currentTab?.url) {
      return;
    }
    setIsFetching(true);
    const lastVisitedText = await getlastVisitedText(currentTab.url);
    setLastVisited(lastVisitedText);
    setIsFetching(false);
  }, [currentTab?.url]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    initLastVisited();
  }, [initLastVisited, isSignedIn]);

  const handleUpdateLastVisited = async () => {
    if (!currentTab?.url) {
      return;
    }
    setIsFetching(true);
    const { hostname } = new URL(currentTab.url);
    const hash = await sha256Hash(hostname);
    const result = await trpcApi.firebaseData.upsertLastVisited.mutate({
      hash,
    });
    // Patch local storage with just this entry
    const lastVisitedObj = await getLastVisited();
    lastVisitedObj[result.hash] = result.timestamp;
    await browser.storage.local.set({
      [STORAGE_KEYS.lastVisited]: lastVisitedObj,
    });
    // Update local state
    await initLastVisited();
    setIsFetching(false);
  };

  return (
    <Tooltip
      withArrow
      label={<Text>{lastVisited}</Text>}
      disabled={!lastVisited}
      radius="md"
      color="gray"
    >
      <Button
        fullWidth
        radius="xl"
        loading={isFetching}
        disabled={!isSignedIn}
        rightSection={lastVisited ? <FaCalendarCheck /> : <FaCalendarTimes />}
        color={lastVisited ? 'teal' : 'red'}
        data-testid="last-visited-button"
        onClick={handleUpdateLastVisited}
      >
        Visited
      </Button>
    </Tooltip>
  );
}

export default LastVisitedButton;
