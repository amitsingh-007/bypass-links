import { noOp } from '@bypass/shared';
import { Button, Spinner } from '@bypass/ui';
import { cn } from '@bypass/ui/lib/utils';
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
      // Returned, not bare: the consistent-return rule needs both paths to yield
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

  const isLoading = buttonState === EButtonState.LOADING;
  const isSuccess = isOnForumPage && buttonState === EButtonState.SUCCESS;

  return (
    <Button
      className={cn(
        'w-full font-medium',
        isSuccess &&
          'border-teal-600 bg-teal-600 hover:border-teal-700 hover:bg-teal-700'
      )}
      variant={isSuccess ? 'default' : 'secondary'}
      disabled={!isSuccess && (!isOnForumPage || isLoading)}
      onClick={onClick}
    >
      {isLoading && <Spinner className="mr-2 size-4" />}
      {isSuccess ? 'Success' : 'Forum'}
      <HugeiconsIcon
        icon={isSuccess ? CheckmarkBadge02Icon : WebDesign01Icon}
        strokeWidth={2}
        className="ml-2 size-4"
      />
    </Button>
  );
}

export default OpenForumLinks;
