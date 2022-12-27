import Header from '@bypass/shared/components/Header';
import { IPerson } from '@bypass/shared/components/Persons/interfaces/persons';
import { Button, LoadingOverlay } from '@mantine/core';
import useToastStore from '@store/toast';
import { memo, useState } from 'react';
import { IoIosPersonAdd } from 'react-icons/io';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { syncPersonsFirebaseWithStorage } from '../utils/sync';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  isFetching: boolean;
  handleAddPerson: any;
  persons: IPerson[];
  onSearchChange: (text: string) => void;
}

const PersonHeader = memo<Props>(function PersonHeader({
  isFetching,
  handleAddPerson,
  persons,
  onSearchChange,
}) {
  const displayToast = useToastStore((state) => state.displayToast);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

  const toggleAddPersonDialog = () => {
    setShowAddPersonDialog(!showAddPersonDialog);
  };

  const handlePersonSave = (person: IPerson) => {
    handleAddPerson(person);
    toggleAddPersonDialog();
  };

  const onSyncClick = async () => {
    if (isSyncing) {
      return;
    }
    setIsSyncing(true);
    try {
      await syncPersonsFirebaseWithStorage();
      displayToast({ message: 'Persons synced succesfully' });
    } catch (ex) {
      console.error('Persons synced failed', ex);
      displayToast({ message: 'Persons synced failed', severity: 'error' });
    }
    setIsSyncing(false);
  };

  return (
    <>
      <Header onSearchChange={onSearchChange} text={persons?.length || 0}>
        <Button
          radius="xl"
          variant="light"
          leftIcon={<IoIosPersonAdd />}
          onClick={toggleAddPersonDialog}
          disabled={isFetching}
        >
          Add
        </Button>
        <Button
          radius="xl"
          variant="light"
          leftIcon={<RiUploadCloud2Fill />}
          onClick={onSyncClick}
          loading={isSyncing}
          color="yellow"
          disabled={!isSyncing && isFetching}
        >
          Sync
        </Button>
      </Header>
      {showAddPersonDialog && (
        <AddOrEditPersonDialog
          isOpen={showAddPersonDialog}
          onClose={toggleAddPersonDialog}
          handleSaveClick={handlePersonSave}
        />
      )}
      <LoadingOverlay visible={isSyncing} />
    </>
  );
});

export default PersonHeader;
