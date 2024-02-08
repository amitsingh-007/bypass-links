import { EBypassKeys } from '@/constants';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { matchHostnames } from '@/utils/common';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { getCurrentTab } from '@/utils/tabs';
import { Button } from '@mantine/core';
import { MdForum } from '@react-icons/all-files/md/MdForum';
import useHistoryStore from '@store/history';
import { memo, useCallback, useEffect, useState } from 'react';

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return (
    (await matchHostnames(hostname, EBypassKeys.FORUMS)) ||
    (await matchHostnames(hostname, EBypassKeys.FORUMS_V2))
  );
};

const OpenForumLinks = memo(function OpenForumLinks() {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
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
    const { forumPageLinks } = await sendRuntimeMessage({
      key: 'forumPageLinks',
      tabId: currentTab?.id,
      url: currentTab?.url,
    });
    forumPageLinks.forEach((url) => {
      chrome.tabs.create({ url, active: false });
    });
    setIsFetching(false);
  };

  return (
    <Button
      radius="xl"
      loading={isFetching}
      disabled={!isActive}
      onClick={handleClick}
      rightSection={<MdForum />}
      fullWidth
      color="yellow"
    >
      Forum
    </Button>
  );
});

export default OpenForumLinks;
