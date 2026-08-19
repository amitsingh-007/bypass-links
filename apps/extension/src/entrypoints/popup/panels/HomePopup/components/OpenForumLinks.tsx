import { noOp } from '@bypass/shared';
import { Button, Spinner } from '@bypass/ui';
import {
  CheckmarkBadge02Icon,
  WebDesign01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { isForumPage } from '@background/websites';
import useCurrentTab from '@popup/hooks/useCurrentTab';

enum EButtonState {
  INITIAL,
  LOADING,
  SUCCESS,
}

const SUCCESS_TIMEOUT_MS = 3000;

const isCurrentPageForum = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  return isForumPage(hostname);
};

function OpenForumLinks() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isOnForumPage, setIsOnForumPage] = useState(false);
  const [buttonState, setButtonState] = useState(EButtonState.INITIAL);

  useEffect(() => {
    const initIsActive = async () => {
      const isForum = isSignedIn && (await isCurrentPageForum(currentTab?.url));
      setIsOnForumPage(isForum);
    };
    initIsActive();
  }, [currentTab?.url, isSignedIn]);

  useEffect(() => {
    if (buttonState !== EButtonState.SUCCESS) {
      return noOp;
    }
    const timeout = setTimeout(
      () => setButtonState(EButtonState.INITIAL),
      SUCCESS_TIMEOUT_MS
    );
    return () => clearTimeout(timeout);
  }, [buttonState]);

  const onClick = async () => {
    setButtonState(EButtonState.LOADING);

    if (currentTab?.id && currentTab?.url) {
      const { forumPageLinks } = await sendRuntimeMessage({
        key: 'openWebsiteLinks',
        tabId: currentTab.id,
        url: currentTab.url,
      });

      // Opened by the background so the links keep coming after the popup closes
      await sendRuntimeMessage({
        key: 'openLinksInTabs',
        urls: forumPageLinks,
      });
    }

    setButtonState(EButtonState.SUCCESS);
  };

  if (isOnForumPage && buttonState === EButtonState.SUCCESS) {
    return (
      <Button
        className="w-full border-teal-600 bg-teal-600 font-medium hover:border-teal-700 hover:bg-teal-700"
        variant="default"
        onClick={onClick}
      >
        Success
        <HugeiconsIcon
          icon={CheckmarkBadge02Icon}
          strokeWidth={2}
          className="ml-2 size-4"
        />
      </Button>
    );
  }

  return (
    <Button
      className="w-full font-medium"
      variant="secondary"
      disabled={!isOnForumPage || buttonState === EButtonState.LOADING}
      onClick={onClick}
    >
      {buttonState === EButtonState.LOADING && (
        <Spinner className="mr-2 size-4" />
      )}
      Forum
      <HugeiconsIcon
        icon={WebDesign01Icon}
        strokeWidth={2}
        className="ml-2 size-4"
      />
    </Button>
  );
}

export default OpenForumLinks;
