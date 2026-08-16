import useSWR from 'swr';

import { useIsSignedIn } from '@/store/firebase/useFirebaseStore';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { isForumPage } from '@background/websites';
import useCurrentTab from '@popup/hooks/useCurrentTab';

import ButtonWithFeedback from './ButtonWithFeedback';

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return isForumPage(hostname);
};

function OpenForumLinks() {
  const isSignedIn = useIsSignedIn();
  const currentTab = useCurrentTab();
  const { data: isOnForumPage = false } = useSWR(
    isSignedIn && currentTab?.url ? ['forum-page', currentTab.url] : null,
    async ([, url]) => isCurrentPageForum(url)
  );

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
