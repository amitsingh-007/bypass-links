import { useEffect, useState } from 'react';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { isForumPage } from '@background/websites';
import useCurrentTab from '@popup/hooks/useCurrentTab';

import ButtonWithFeedback from './ButtonWithFeedback';

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return isForumPage(hostname);
};

function OpenForumLinks() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isOnForumPage, setIsOnForumPage] = useState(false);

  useEffect(() => {
    const initIsActive = async () => {
      const isForum = isSignedIn && (await isCurrentPageForum(currentTab?.url));
      setIsOnForumPage(isForum);
    };
    initIsActive();
  }, [currentTab?.url, isSignedIn]);

  const openForumlinks = async () => {
    if (!currentTab?.id || !currentTab?.url) {
      return;
    }
    const { forumPageLinks } = await sendRuntimeMessage({
      key: 'openWebsiteLinks',
      tabId: currentTab.id,
      url: currentTab.url,
    });

    // Opened by the background so the links keep coming after the popup closes
    await sendRuntimeMessage({ key: 'openLinksInTabs', urls: forumPageLinks });
  };

  return (
    <ButtonWithFeedback
      openAllLinks={openForumlinks}
      isForumPage={isOnForumPage}
    />
  );
}

export default OpenForumLinks;
