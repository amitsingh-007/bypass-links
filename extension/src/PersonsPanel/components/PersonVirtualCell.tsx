import Person from '@bypass/shared/components/Persons/components/Person';
import { IPerson } from '@bypass/shared/components/Persons/interfaces/persons';
import { getReactKey } from '@bypass/shared/components/Persons/utils';
import ContextMenu, { IMenuOptions } from '@/components/ContextMenu';
import { Box, useMantineTheme } from '@mantine/core';
import { memo, useCallback, useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { RiBookmark2Fill } from 'react-icons/ri';
import { areEqual } from 'react-window';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface PersonVirtualCellProps {
  persons: IPerson[];
  handleEditPerson: (person: IPerson) => void;
  handlePersonDelete: (person: IPerson) => void;
}

const PersonVirtualCell = memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: PersonVirtualCellProps;
}>(({ columnIndex, rowIndex, data, style }) => {
  const theme = useMantineTheme();
  const { persons, handleEditPerson, handlePersonDelete } = data;
  const index = getReactKey(rowIndex, columnIndex);
  const person = persons[index];
  const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);
  const [menuOptions, setMenuOptions] = useState<IMenuOptions[]>([]);

  const handleDeleteOptionClick = useCallback(() => {
    handlePersonDelete(person);
  }, [handlePersonDelete, person]);

  const toggleEditPersonDialog = useCallback(() => {
    setShowEditPersonDialog(!showEditPersonDialog);
  }, [showEditPersonDialog]);

  useEffect(() => {
    const menuOptions = [
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
    setMenuOptions(menuOptions);
  }, [handleDeleteOptionClick, toggleEditPersonDialog, theme.colors]);

  const handlePersonSave = (updatedPerson: IPerson) => {
    handleEditPerson(updatedPerson);
    toggleEditPersonDialog();
  };

  if (index >= persons.length) {
    return null;
  }
  return (
    <Box style={style} sx={{ padding: '8px' }}>
      <Box>
        <ContextMenu options={menuOptions}>
          <Person person={person} />
        </ContextMenu>
      </Box>
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
}, areEqual);
PersonVirtualCell.displayName = 'PersonVirtualCell';

export default PersonVirtualCell;
