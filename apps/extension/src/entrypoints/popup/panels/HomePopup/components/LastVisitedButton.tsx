import { sha256Hash } from '@bypass/shared';
import {
  Button,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bypass/ui';
import { useCallback, useEffect, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import useCurrentTab from '@popup/hooks/useCurrentTab';
import { trpcApi } from '@/apis/trpcApi';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { getlastVisitedText } from '@/utils/lastVisited';
import { lastVisitedItem } from '@/storage/items';

function LastVisitedButton() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState('');

  const initLastVisited = useCallback(async () => {
    if (!currentTab?.url) {
      return;
    }
    setIsFetching(true);
    const lastVisitedText = await getlastVisitedText(currentTab.url);
    setLastVisited(lastVisitedText);
    setIsFetching(false);
  }, [currentTab?.url]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    initLastVisited();
  }, [initLastVisited, isSignedIn]);

  const handleUpdateLastVisited = async () => {
    if (!currentTab?.url) {
      return;
    }
    setIsFetching(true);
    const { hostname } = new URL(currentTab.url);
    const hash = await sha256Hash(hostname);
    const result = await trpcApi.firebaseData.upsertLastVisited.mutate({
      hash,
    });
    // Patch local storage with just this entry
    const lastVisitedObj = await lastVisitedItem.getValue();
    lastVisitedObj[result.hash] = result.timestamp;
    await lastVisitedItem.setValue(lastVisitedObj);
    // Update local state
    await initLastVisited();
    setIsFetching(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          className="w-full"
          variant={lastVisited ? 'default' : 'outline'}
          disabled={!isSignedIn || isFetching}
          data-testid="last-visited-button"
          onClick={handleUpdateLastVisited}
        >
          {isFetching && <Spinner className="mr-2 size-4 animate-spin" />}
          Visited
          {lastVisited ? (
            <FaCalendarCheck className="ml-2 size-4" />
          ) : (
            <FaCalendarTimes className="ml-2 size-4" />
          )}
        </Button>
      </TooltipTrigger>
      {lastVisited && (
        <TooltipContent>
          <p>{lastVisited}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export default LastVisitedButton;
