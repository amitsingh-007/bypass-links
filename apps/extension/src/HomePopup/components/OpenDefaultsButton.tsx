import { getRedirections } from '@helpers/fetchFromStorage';
import { Button } from '@mantine/core';
import useHistoryStore from '@store/history';
import { useState } from 'react';
import { RxExternalLink } from 'react-icons/rx';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

const OpenDefaultsButton = () => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    startHistoryMonitor();
    const redirections = await getRedirections();
    const defaults = redirections.filter(
      ({ isDefault }: { isDefault: boolean }) => isDefault
    );
    defaults
      .filter((data) => data?.alias && data.website)
      .forEach(({ website }) => {
        chrome.tabs.create({ url: atob(website), active: false });
      });
    setIsFetching(false);
  };

  return (
    <Button
      radius="xl"
      loading={isFetching}
      disabled={!isSignedIn}
      onClick={handleOpenDefaults}
      rightSection={<RxExternalLink />}
      fullWidth
      color="yellow"
    >
      Defaults
    </Button>
  );
};

export default OpenDefaultsButton;
