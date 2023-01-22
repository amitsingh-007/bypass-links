import { matchHostnames } from '@/utils/common';
import { BYPASS_KEYS } from '@constants/index';
import runtime from '@helpers/chrome/runtime';
import tabs, { getCurrentTab } from '@helpers/chrome/tabs';
import { Button } from '@mantine/core';
import useAuthStore from '@store/auth';
import useHistoryStore from '@store/history';
import { memo, useCallback, useEffect, useState } from 'react';
import { MdForum } from 'react-icons/md';

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return (
    (await matchHostnames(hostname, BYPASS_KEYS.FORUMS)) ||
    (await matchHostnames(hostname, BYPASS_KEYS.FORUMS_V2))
  );
};

const OpenForumLinks = memo(function OpenForumLinks() {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isActive, setIsActive] = useState(false);

  const initCurrentTab = async () => {
    const curTab = await getCurrentTab();
    setCurrentTab(curTab);
  };

  useEffect(() => {
    initCurrentTab();
  }, []);

  const initIsActive = useCallback(async () => {
    const isForum = isSignedIn && (await isCurrentPageForum(currentTab?.url));
    setIsActive(isForum);
  }, [currentTab?.url, isSignedIn]);

  useEffect(() => {
    initIsActive();
  }, [isSignedIn, currentTab, initIsActive]);

  const handleClick = async () => {
    setIsFetching(true);
    startHistoryMonitor();
    const { forumPageLinks } = await runtime.sendMessage<{
      forumPageLinks: string[];
      url: string;
    }>({
      getForumPageLinks: currentTab?.id,
      url: currentTab?.url,
    });
    forumPageLinks.forEach((url) => {
      tabs.create({ url, active: false });
    });
    setIsFetching(false);
  };

  return (
    <Button
      variant="light"
      radius="xl"
      loaderPosition="right"
      loading={isFetching}
      disabled={!isActive}
      onClick={handleClick}
      rightIcon={<MdForum />}
      fullWidth
      color="yellow"
    >
      Forum
    </Button>
  );
});

export default OpenForumLinks;
