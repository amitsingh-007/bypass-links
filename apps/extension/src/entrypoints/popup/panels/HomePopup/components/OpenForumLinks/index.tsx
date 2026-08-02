import { DynamicContext, sleep } from '@bypass/shared';
import { use, useEffect, useState } from 'react';

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
  const { tabs } = use(DynamicContext);
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

    // Paced deliberately: forums rate-limit rapid opens
    /* oxlint-disable no-await-in-loop */
    for (const url of forumPageLinks) {
      tabs.open(url);
      await sleep(1000); // 1sec
    }
    /* oxlint-enable no-await-in-loop */
  };

  return (
    <ButtonWithFeedback
      openAllLinks={openForumlinks}
      isForumPage={isOnForumPage}
    />
  );
}

export default OpenForumLinks;
