import { Button, LoadingOverlay } from '@mantine/core';
import { useState } from 'react';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { syncStorageToFirebase } from '../utils/sync';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

const SyncButton = () => {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncStorageToFirebase();
    setIsSyncing(false);
  };

  return (
    <>
      <Button
        radius="xl"
        color="yellow"
        disabled={!isSignedIn}
        loading={isSyncing}
        onClick={handleSync}
        rightSection={<RiUploadCloud2Fill />}
        fullWidth
      >
        Sync
      </Button>
      {isSyncing && <LoadingOverlay w="100%" visible zIndex={100} />}
    </>
  );
};

export default SyncButton;
