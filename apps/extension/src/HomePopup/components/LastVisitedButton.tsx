import { getLastVisited } from '@helpers/fetchFromStorage';
import { Button, Text, Tooltip } from '@mantine/core';
import md5 from 'md5';
import { useCallback, useEffect, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { syncLastVisitedToStorage } from '@/HomePopup/utils/lastVisited';
import { trpcApi } from '@/apis/trpcApi';
import useCurrentTab from '@/hooks/useCurrentTab';
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
  }, [initLastVisited, isSignedIn, lastVisited]);

  const handleUpdateLastVisited = async () => {
    if (!currentTab?.url) {
      return;
    }
    const lastVisitedObj = await getLastVisited();
    setIsFetching(true);
    const { hostname } = new URL(currentTab.url);
    lastVisitedObj[md5(hostname)] = Date.now();
    const isSuccess =
      await trpcApi.firebaseData.lastVisitedPost.mutate(lastVisitedObj);
    if (isSuccess) {
      await syncLastVisitedToStorage();
    }
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
        onClick={handleUpdateLastVisited}
      >
        Visited
      </Button>
    </Tooltip>
  );
}

export default LastVisitedButton;
