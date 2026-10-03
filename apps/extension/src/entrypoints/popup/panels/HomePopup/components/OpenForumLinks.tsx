import { Button, Spinner } from '@bypass/ui';
import { cn } from '@bypass/ui/lib/utils';
import {
  CheckmarkBadge02Icon,
  WebDesign01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTimeout } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { extSwrKeys } from '@/swr/keys';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { isForumPage } from '@background/websites';
import useCurrentTab from '@popup/hooks/useCurrentTab';

enum EButtonState {
  INITIAL,
  LOADING,
  SUCCESS,
}

const SUCCESS_TIMEOUT_MS = 3000;

function OpenForumLinks() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const { data: isOnForumPage = false } = useSWR(
    isSignedIn ? extSwrKeys.forumPage(currentTab?.url) : null,
    ([, url]) => isForumPage(url)
  );
  const [buttonState, setButtonState] = useState(EButtonState.INITIAL);
  const { start: startSuccessReset, clear: cancelSuccessReset } = useTimeout(
    () => setButtonState(EButtonState.INITIAL),
    SUCCESS_TIMEOUT_MS
  );

  useEffect(() => {
    if (buttonState === EButtonState.SUCCESS) {
      startSuccessReset();
    }
    return cancelSuccessReset;
  }, [buttonState, cancelSuccessReset, startSuccessReset]);

  const onClick = async () => {
    if (currentTab?.id == null || !currentTab.url) {
      return;
    }
    cancelSuccessReset();
    setButtonState(EButtonState.LOADING);

    try {
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
      setButtonState(EButtonState.SUCCESS);
    } catch (error) {
      console.error('Could not open forum links', error);
      toast.error('Could not open forum links');
      setButtonState(EButtonState.INITIAL);
    }
  };

  const isLoading = buttonState === EButtonState.LOADING;
  const isSuccess = isOnForumPage && buttonState === EButtonState.SUCCESS;

  return (
    <Button
      data-testid="forum-button"
      className={cn(
        'w-full',
        isSuccess &&
          'border-success bg-success hover:border-success-hover hover:bg-success-hover'
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
