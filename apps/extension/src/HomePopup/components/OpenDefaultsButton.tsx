import { STORAGE_KEYS } from '@bypass/shared';
import { Button } from '@mantine/core';
import useAuthStore from '@store/auth';
import useHistoryStore from '@store/history';
import { memo, useState } from 'react';
import { RxExternalLink } from 'react-icons/rx';

const OpenDefaultsButton = memo(function OpenDefaultsButton() {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    startHistoryMonitor();
    const { [STORAGE_KEYS.redirections]: redirections } =
      await chrome.storage.local.get([STORAGE_KEYS.redirections]);
    const defaults = redirections.filter(
      ({ isDefault }: { isDefault: boolean }) => isDefault
    );
    defaults
      .filter((data: any) => data && data.alias && data.website)
      .forEach(({ website }: any) => {
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
});

export default OpenDefaultsButton;
