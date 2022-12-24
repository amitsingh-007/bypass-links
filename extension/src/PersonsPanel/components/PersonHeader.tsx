import { IPerson } from '@bypass/shared/components/Persons/interfaces/persons';
import Search from '@bypass/shared/components/Search';
import { Badge, Button, Group, Header } from '@mantine/core';
import useToastStore from '@store/toast';
import { memo, useState } from 'react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { IoIosPersonAdd } from 'react-icons/io';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const displayToast = useToastStore((state) => state.displayToast);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

  const toggleAddPersonDialog = () => {
    setShowAddPersonDialog(!showAddPersonDialog);
  };

  const handleAddPersonClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    toggleAddPersonDialog();
  };

  const handlePersonSave = (person: IPerson) => {
    handleAddPerson(person);
    toggleAddPersonDialog();
  };

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    navigate(-1);
  };

  const onSyncClick: React.MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.stopPropagation();
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
      <Header
        height={56}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <Group>
          <Button
            radius="xl"
            variant="light"
            color="red"
            leftIcon={<HiOutlineArrowNarrowLeft />}
            onClick={handleClose}
            disabled={isFetching}
          >
            Back
          </Button>
          <Button
            radius="xl"
            variant="light"
            leftIcon={<IoIosPersonAdd />}
            onClick={handleAddPersonClick}
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
        </Group>
        <Group>
          <Search onChange={onSearchChange} />
          <Badge size="lg" radius="lg">
            {persons?.length || 0}
          </Badge>
        </Group>
      </Header>
      {showAddPersonDialog && (
        <AddOrEditPersonDialog
          isOpen={showAddPersonDialog}
          onClose={toggleAddPersonDialog}
          handleSaveClick={handlePersonSave}
        />
      )}
    </>
  );
});

export default PersonHeader;
