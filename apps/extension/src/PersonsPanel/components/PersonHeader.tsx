import { Header, IPerson } from '@bypass/shared';
import { Button, LoadingOverlay } from '@mantine/core';
import { memo, useState } from 'react';
import { IoIosPersonAdd } from 'react-icons/io';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  isFetching: boolean;
  handleAddPerson: (person: IPerson) => Promise<void>;
  persons: IPerson[];
  onSearchChange: (text: string) => void;
}

const PersonHeader = memo<Props>(
  ({ isFetching, handleAddPerson, persons, onSearchChange }) => {
    const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

    const toggleAddPersonDialog = () => {
      setShowAddPersonDialog(!showAddPersonDialog);
    };

    const handlePersonSave = async (person: IPerson) => {
      await handleAddPerson(person);
      toggleAddPersonDialog();
    };

    return (
      <>
        <Header onSearchChange={onSearchChange} text={persons?.length || 0}>
          <Button
            size="xs"
            radius="xl"
            leftSection={<IoIosPersonAdd />}
            onClick={toggleAddPersonDialog}
            disabled={isFetching}
          >
            Add
          </Button>
          {isFetching && <LoadingOverlay w="100%" visible zIndex={100} />}
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
  }
);

export default PersonHeader;
