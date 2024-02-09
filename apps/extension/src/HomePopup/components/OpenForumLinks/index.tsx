import { EBypassKeys } from '@/constants';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { matchHostnames } from '@/utils/common';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { getCurrentTab } from '@/utils/tabs';
import useHistoryStore from '@store/history';
import { memo, useEffect, useState } from 'react';
import ButtonWithFeedback from './ButtonWithFeedback';

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
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab>();
  const [isForumPage, setIsForumPage] = useState(false);

  useEffect(() => {
    const initCurrentTab = async () => {
      const curTab = await getCurrentTab();
      setCurrentTab(curTab);
    };
    initCurrentTab();
  }, []);

  useEffect(() => {
    const initIsActive = async () => {
      const isForum = isSignedIn && (await isCurrentPageForum(currentTab?.url));
      setIsForumPage(isForum);
    };
    initIsActive();
  }, [currentTab?.url, isSignedIn]);

  const openForumlinks = async () => {
    startHistoryMonitor();
    const { forumPageLinks } = await sendRuntimeMessage({
      key: 'forumPageLinks',
      tabId: currentTab?.id,
      url: currentTab?.url,
    });
    forumPageLinks.forEach((url) => {
      chrome.tabs.create({ url, active: false });
    });
  };

  return (
    <ButtonWithFeedback
      openAllLinks={openForumlinks}
      isForumPage={isForumPage}
    />
  );
});

export default OpenForumLinks;
