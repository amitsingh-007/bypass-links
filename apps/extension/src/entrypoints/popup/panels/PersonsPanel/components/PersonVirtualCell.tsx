import { type IPerson, Person } from '@bypass/shared';
import { Delete02Icon, Edit01Icon } from '@hugeicons/core-free-icons';
import { useDisclosure } from '@mantine/hooks';

import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';

import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  person: IPerson;
  imageUrl?: string;
  handleEditPerson: (
    person: IPerson,
    hasImageChanged: boolean
  ) => Promise<void>;
  handlePersonDelete: (person: IPerson) => void;
}

function PersonVirtualCell({
  person,
  imageUrl,
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

  const handlePersonSave = async (
    updatedPerson: IPerson,
    hasImageChanged: boolean
  ) => {
    await handleEditPerson(updatedPerson, hasImageChanged);
    editPersonDialogHandlers.close();
  };

  return (
    <>
      <ContextMenu options={menuOptions}>
        <Person person={person} imageUrl={imageUrl} />
      </ContextMenu>
      {showEditPersonDialog && (
        <AddOrEditPersonDialog
          person={person}
          isOpen={showEditPersonDialog}
          handleSaveClick={handlePersonSave}
          onClose={editPersonDialogHandlers.close}
        />
      )}
    </>
  );
}

export default PersonVirtualCell;
