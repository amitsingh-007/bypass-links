import useCurrentTab from '@/hooks/useCurrentTab';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import useHistoryStore from '@store/history';
import { useEffect, useState } from 'react';
import ButtonWithFeedback from './ButtonWithFeedback';
import { isForumPage } from '@/BackgroundScript/websites';

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return isForumPage(hostname);
};

const OpenForumLinks = () => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isForumPage, setIsForumPage] = useState(false);

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
};

export default OpenForumLinks;
