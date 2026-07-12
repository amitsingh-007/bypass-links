import { Button, Spinner } from '@bypass/ui';
import { LinkSquare02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

import { redirectionsItem } from '@/storage/items';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useHistoryStore from '@store/history';

function OpenDefaultsButton() {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    startHistoryMonitor();
    const redirections = await redirectionsItem.getValue();
    const defaults = redirections.filter(
      ({ isDefault }: { isDefault: boolean }) => isDefault
    );
    defaults
      .filter((data) => data?.alias && data.website)
      .forEach(({ website }) => {
        browser.tabs.create({ url: atob(website), active: false });
      });
    setIsFetching(false);
  };

  return (
    <Button
      className="w-full font-medium"
      variant="secondary"
      disabled={!isSignedIn || isFetching}
      data-testid="open-defaults-button"
      onClick={handleOpenDefaults}
    >
      {isFetching && <Spinner className="mr-2 size-4" />}
      Defaults
      <HugeiconsIcon
        icon={LinkSquare02Icon}
        strokeWidth={2}
        className="ml-2 size-4"
      />
    </Button>
  );
}

export default OpenDefaultsButton;
