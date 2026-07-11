import { type IPerson, Person } from '@bypass/shared';
import { useDisclosure } from '@mantine/hooks';
import { Delete02Icon, Edit01Icon } from '@hugeicons/core-free-icons';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  person: IPerson;
  handleEditPerson: (person: IPerson) => Promise<void>;
  handlePersonDelete: (person: IPerson) => void;
}

function PersonVirtualCell({
  person,
  handleEditPerson,
  handlePersonDelete,
}: Props) {
  const [showEditPersonDialog, editPersonDialogHandlers] = useDisclosure(false);

  const handleDeleteOptionClick = () => {
    handlePersonDelete(person);
  };

  const menuOptions: IMenuOption[] = [
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

export default PersonVirtualCell;
