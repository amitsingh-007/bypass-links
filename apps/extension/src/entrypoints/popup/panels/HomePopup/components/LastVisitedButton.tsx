import { sha256Hash } from '@bypass/shared';
import {
  Button,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bypass/ui';
import {
  CalendarAdd01Icon,
  Appointment01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

import { trpcApi } from '@/apis/trpcApi';
import { lastVisitedItem } from '@/storage/items';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useCurrentTab from '@popup/hooks/useCurrentTab';
import useLastVisited from '@popup/hooks/useLastVisited';

function LastVisitedButton() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const currentTab = useCurrentTab();
  const [isFetching, setIsFetching] = useState(false);

  const url = currentTab?.url;
  const { data: lastVisited = '', mutate: mutateLastVisited } = useLastVisited(
    isSignedIn ? url : undefined
  );

  const handleUpdateLastVisited = async () => {
    if (!url) {
      return;
    }
    setIsFetching(true);
    const { hostname } = new URL(url);
    const hash = await sha256Hash(hostname);
    const result = await trpcApi.firebaseData.upsertLastVisited.mutate({
      hash,
    });
    // Patch local storage with just this entry
    const lastVisitedObj = await lastVisitedItem.getValue();
    lastVisitedObj[result.hash] = result.timestamp;
    await lastVisitedItem.setValue(lastVisitedObj);
    await mutateLastVisited();
    setIsFetching(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          className="w-full font-medium"
          variant={lastVisited ? 'default' : 'outline'}
          disabled={!isSignedIn || isFetching}
          data-testid="last-visited-button"
          onClick={handleUpdateLastVisited}
        >
          {isFetching && <Spinner className="mr-2 size-4" />}
          Visited
          <HugeiconsIcon
            icon={lastVisited ? Appointment01Icon : CalendarAdd01Icon}
            strokeWidth={2}
            className="ml-2 size-4"
          />
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
