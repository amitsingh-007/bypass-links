import { Tooltip, TooltipContent, TooltipTrigger } from '@bypass/ui';
import {
  CalendarAdd01Icon,
  Appointment01Icon,
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

import { trpcApi } from '@/apis/trpcApi';
import { useIsSignedIn } from '@/store/firebase/useFirebaseStore';
import { extSwrKeys } from '@/swr/keys';
import useCurrentTab from '@popup/hooks/useCurrentTab';
import useLastVisited from '@popup/hooks/useLastVisited';
import {
  getHostnameHash,
  setLastVisitedInStorage,
} from '@popup/utils/lastVisited';

import HomeActionButton from './HomeActionButton';

function LastVisitedButton() {
  const isSignedIn = useIsSignedIn();
  const currentTab = useCurrentTab();

  const url = currentTab?.url;
  const { data: lastVisited = '' } = useLastVisited(
    isSignedIn ? url : undefined
  );

  const { trigger: updateLastVisited, isMutating } = useSWRMutation(
    extSwrKeys.lastVisited(url),
    async ([, pageUrl]) => {
      const hash = await getHostnameHash(pageUrl);
      const result = await trpcApi.firebaseData.upsertLastVisited.mutate({
        hash,
      });
      await setLastVisitedInStorage(result.hash, result.timestamp);
    },
    { onError: () => toast.error('Could not update last visited') }
  );

  const handleUpdateLastVisited = () => {
    if (!url) {
      return;
    }
    updateLastVisited();
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <HomeActionButton
          label="Visited"
          icon={lastVisited ? Appointment01Icon : CalendarAdd01Icon}
          variant={lastVisited ? 'default' : 'outline'}
          isBusy={isMutating}
          testId="last-visited-button"
          onClick={handleUpdateLastVisited}
        />
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
