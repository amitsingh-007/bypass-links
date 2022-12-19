import { Box } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import { areEqual } from 'react-window';
import { IPerson } from '@bypass/shared/components/Persons/interfaces/persons';
import { getReactKey } from '@bypass/shared/components/Persons/utils';
import Person from '@bypass/shared/components/Persons/components/Person';
import ContextMenu from 'GlobalComponents/ContextMenu';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';
import { AiFillEdit } from 'react-icons/ai';
import { RiBookmark2Fill } from 'react-icons/ri';
import { IMenuOptions } from 'GlobalInterfaces/menu';
import { GRID_COLUMN_SIZE } from '../constants';

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
  const { persons, handleEditPerson, handlePersonDelete } = data;
  const index = getReactKey(rowIndex, columnIndex, GRID_COLUMN_SIZE);
  const person = persons[index];
  const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);
  const [menuOptions, setMenuOptions] = useState<IMenuOptions>([]);

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
      },
      {
        onClick: handleDeleteOptionClick,
        text: 'Delete',
        icon: RiBookmark2Fill,
      },
    ];
    setMenuOptions(menuOptions);
  }, [handleDeleteOptionClick, toggleEditPersonDialog]);

  const handlePersonSave = (updatedPerson: IPerson) => {
    handleEditPerson(updatedPerson);
    toggleEditPersonDialog();
  };

  if (index >= persons.length) {
    return null;
  }
  return (
    <Box style={style}>
      <ContextMenu getMenuOptions={() => menuOptions}>
        <Person person={person} />
        {showEditPersonDialog && (
          <AddOrEditPersonDialog
            person={person}
            isOpen={showEditPersonDialog}
            onClose={toggleEditPersonDialog}
            handleSaveClick={handlePersonSave}
          />
        )}
      </ContextMenu>
    </Box>
  );
}, areEqual);
PersonVirtualCell.displayName = 'PersonVirtualCell';

export default PersonVirtualCell;
