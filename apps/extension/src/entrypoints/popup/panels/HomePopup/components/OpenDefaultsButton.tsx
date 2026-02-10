import { Button, Spinner } from '@bypass/ui';
import useHistoryStore from '@store/history';
import { useState } from 'react';
import { RxExternalLink } from 'react-icons/rx';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { redirectionsItem } from '@/storage/items';

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
      className="w-full"
      variant="secondary"
      disabled={!isSignedIn || isFetching}
      data-testid="open-defaults-button"
      onClick={handleOpenDefaults}
    >
      {isFetching && <Spinner className="mr-2 size-4 animate-spin" />}
      Defaults
      <RxExternalLink className="ml-2 size-4" />
    </Button>
  );
}

export default OpenDefaultsButton;
