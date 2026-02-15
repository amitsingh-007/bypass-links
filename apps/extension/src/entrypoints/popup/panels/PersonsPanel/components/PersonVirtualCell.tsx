import { type IPerson, Person } from '@bypass/shared';
import { Delete04Icon, Edit01Icon } from '@hugeicons/core-free-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  person: IPerson;
  handleEditPerson: (person: IPerson) => Promise<void>;
  handlePersonDelete: (person: IPerson) => void;
}

const PersonVirtualCell = memo<Props>(
  ({ person, handleEditPerson, handlePersonDelete }) => {
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
          icon: Edit01Icon,
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          id: 'delete',
          icon: Delete04Icon,
          variant: 'destructive',
        },
      ];
      return options;
    }, [handleDeleteOptionClick, toggleEditPersonDialog]);

    const handlePersonSave = async (updatedPerson: IPerson) => {
      await handleEditPerson(updatedPerson);
      toggleEditPersonDialog();
    };

    return (
      <div className="h-full p-2">
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
      </div>
    );
  }
);

export default PersonVirtualCell;
