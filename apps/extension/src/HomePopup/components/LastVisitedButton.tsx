import { syncLastVisitedToStorage } from '@/HomePopup/utils/lastVisited';
import { trpcApi } from '@/apis/trpcApi';
import useCurrentTab from '@/hooks/useCurrentTab';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { ILastVisited } from '@bypass/shared';
import { getLastVisited } from '@helpers/fetchFromStorage';
import { Button, Text, Tooltip } from '@mantine/core';
import md5 from 'md5';
import { memo, useCallback, useEffect, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';

const LastVisitedButton = memo(function LastVisitedButton() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState('');
  const [lastVisitedObj, setLastVisitedObj] = useState<ILastVisited>({});

  const initLastVisited = useCallback(async () => {
    setIsFetching(true);
    const lastVisitedData = await getLastVisited();
    if (!currentTab?.url) {
      return;
    }
    const { hostname } = new URL(currentTab.url);
    const lastVisitedDate = lastVisitedData[md5(hostname)];
    let displayInfo = '';
    if (lastVisitedDate) {
      const date = new Date(lastVisitedDate);
      displayInfo = `${date.toDateString()}, ${date.toLocaleTimeString()}`;
    }
    setLastVisited(displayInfo);
    setLastVisitedObj(lastVisitedData);
    setIsFetching(false);
  }, [currentTab?.url]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    initLastVisited();
  }, [initLastVisited, isSignedIn, lastVisited]);

  const handleUpdateLastVisited = async () => {
    setIsFetching(true);
    if (!currentTab?.url) {
      return;
    }
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
      label={<Text>{lastVisited}</Text>}
      disabled={!lastVisited}
      withArrow
      radius="md"
      color="gray"
    >
      <Button
        radius="xl"
        loading={isFetching}
        disabled={!isSignedIn}
        onClick={handleUpdateLastVisited}
        rightSection={lastVisited ? <FaCalendarCheck /> : <FaCalendarTimes />}
        fullWidth
        color={lastVisited ? 'teal' : 'red'}
      >
        Visited
      </Button>
    </Tooltip>
  );
});

export default LastVisitedButton;
