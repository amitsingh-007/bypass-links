import ContextMenu, { IMenuOption } from '@/components/ContextMenu';
import { IPerson, Person } from '@bypass/shared';
import { Box, useMantineTheme } from '@mantine/core';
import { memo, useCallback, useMemo, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { RiBookmark2Fill } from 'react-icons/ri';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  person: IPerson;
  handleEditPerson: (person: IPerson) => void;
  handlePersonDelete: (person: IPerson) => void;
}

const PersonVirtualCell = memo<Props>(function PersonVirtualCell({
  person,
  handleEditPerson,
  handlePersonDelete,
}) {
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
        icon: AiFillEdit,
        color: theme.colors.violet[9],
      },
      {
        onClick: handleDeleteOptionClick,
        text: 'Delete',
        icon: RiBookmark2Fill,
        color: theme.colors.red[9],
      },
    ];
    return options;
  }, [handleDeleteOptionClick, theme.colors, toggleEditPersonDialog]);

  const handlePersonSave = (updatedPerson: IPerson) => {
    handleEditPerson(updatedPerson);
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
          onClose={toggleEditPersonDialog}
          handleSaveClick={handlePersonSave}
        />
      )}
    </Box>
  );
});

export default PersonVirtualCell;
