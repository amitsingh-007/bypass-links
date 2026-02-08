import useHistoryStore from '@store/history';
import { useEffect, useState } from 'react';
import { sleep } from '@bypass/shared';
import { isForumPage } from '@background/websites';
import useCurrentTab from '@popup/hooks/useCurrentTab';
import ButtonWithFeedback from './ButtonWithFeedback';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return isForumPage(hostname);
};

function OpenForumLinks() {
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
    if (!currentTab?.id || !currentTab?.url) {
      return;
    }
    startHistoryMonitor();
    const { forumPageLinks } = await sendRuntimeMessage({
      key: 'openWebsiteLinks',
      tabId: currentTab.id,
      url: currentTab.url,
    });

    for (const url of forumPageLinks) {
      await chrome.tabs.create({ url, active: false });
      await sleep(1000); // 1sec
    }
  };

  return (
    <ButtonWithFeedback
      openAllLinks={openForumlinks}
      isForumPage={isForumPage}
    />
  );
}

export default OpenForumLinks;
