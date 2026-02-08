import { type IPerson, Person } from '@bypass/shared';
import { Box, useMantineTheme } from '@mantine/core';
import { memo, useCallback, useMemo, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  person: IPerson;
  handleEditPerson: (person: IPerson) => Promise<void>;
  handlePersonDelete: (person: IPerson) => void;
}

const PersonVirtualCell = memo<Props>(
  ({ person, handleEditPerson, handlePersonDelete }) => {
    const theme = useMantineTheme();
    const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);

    const handleDeleteOptionClick = useCallback(() => {
      handlePersonDelete(person);
    }, [handlePersonDelete, person]);

    const toggleEditPersonDialog = useCallback(() => {
      setShowEditPersonDialog(!showEditPersonDialog);
    }, [showEditPersonDialog]);

    const menuOptions = useMemo(() => {
      const options: IMenuOption[] = [
        {
          onClick: toggleEditPersonDialog,
          text: 'Edit',
          id: 'edit',
          icon: AiFillEdit,
          color: theme.colors.violet[9],
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          id: 'delete',
          icon: MdOutlineDelete,
          color: theme.colors.red[9],
        },
      ];
      return options;
    }, [handleDeleteOptionClick, theme.colors, toggleEditPersonDialog]);

    const handlePersonSave = async (updatedPerson: IPerson) => {
      await handleEditPerson(updatedPerson);
      toggleEditPersonDialog();
    };

    return (
      <Box p="0.5rem" h="100%">
        <ContextMenu options={menuOptions}>
          <Person person={person} />
        </ContextMenu>
        {showEditPersonDialog && (
          <AddOrEditPersonDialog
            person={person}
            isOpen={showEditPersonDialog}
            handleSaveClick={handlePersonSave}
            onClose={toggleEditPersonDialog}
          />
        )}
      </Box>
    );
  }
);

export default PersonVirtualCell;
