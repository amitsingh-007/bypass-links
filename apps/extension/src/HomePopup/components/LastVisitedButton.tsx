import { syncLastVisitedToStorage } from '@/HomePopup/utils/lastVisited';
import { trpcApi } from '@/apis/trpcApi';
import { getCurrentTab } from '@/utils/tabs';
import { ILastVisited } from '@bypass/shared';
import { getLastVisited } from '@helpers/fetchFromStorage';
import { Button, Text, Tooltip } from '@mantine/core';
import useAuthStore from '@store/auth';
import md5 from 'md5';
import { memo, useEffect, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';

const LastVisitedButton = memo(function LastVisitedButton() {
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState('');
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [lastVisitedObj, setLastVisitedObj] = useState<ILastVisited>({});

  const initLastVisited = async () => {
    setIsFetching(true);
    const lastVisitedData = await getLastVisited();
    const curTab = await getCurrentTab();
    if (!curTab?.url) {
      return;
    }
    const { hostname } = new URL(curTab.url);
    const lastVisitedDate = lastVisitedData[md5(hostname)];
    let displayInfo = '';
    if (lastVisitedDate) {
      const date = new Date(lastVisitedDate);
      displayInfo = `${date.toDateString()}, ${date.toLocaleTimeString()}`;
    }
    setLastVisited(displayInfo);
    setLastVisitedObj(lastVisitedData);
    setCurrentTab(curTab);
    setIsFetching(false);
  };

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    initLastVisited();
  }, [isSignedIn, lastVisited]);

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
