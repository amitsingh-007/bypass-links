import { type IPerson, Person } from '@bypass/shared';
import { useDisclosure } from '@mantine/hooks';
import { Delete02Icon, Edit01Icon } from '@hugeicons/core-free-icons';
import { memo, useCallback, useMemo } from 'react';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  person: IPerson;
  handleEditPerson: (person: IPerson) => Promise<void>;
  handlePersonDelete: (person: IPerson) => void;
}

const PersonVirtualCell = memo<Props>(
  ({ person, handleEditPerson, handlePersonDelete }) => {
    const [showEditPersonDialog, editPersonDialogHandlers] =
      useDisclosure(false);

    const handleDeleteOptionClick = useCallback(() => {
      handlePersonDelete(person);
    }, [handlePersonDelete, person]);

    const menuOptions = useMemo(() => {
      const options: IMenuOption[] = [
        {
          onClick: editPersonDialogHandlers.open,
          text: 'Edit',
          id: 'edit',
          icon: Edit01Icon,
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          id: 'delete',
          icon: Delete02Icon,
          variant: 'destructive',
        },
      ];
      return options;
    }, [editPersonDialogHandlers.open, handleDeleteOptionClick]);

    const handlePersonSave = async (updatedPerson: IPerson) => {
      await handleEditPerson(updatedPerson);
      editPersonDialogHandlers.close();
    };

    return (
      <div className="h-full p-1.5">
        <ContextMenu options={menuOptions}>
          <Person person={person} />
        </ContextMenu>
        {showEditPersonDialog && (
          <AddOrEditPersonDialog
            person={person}
            isOpen={showEditPersonDialog}
            handleSaveClick={handlePersonSave}
            onClose={editPersonDialogHandlers.close}
          />
        )}
      </div>
    );
  }
);

export default PersonVirtualCell;
