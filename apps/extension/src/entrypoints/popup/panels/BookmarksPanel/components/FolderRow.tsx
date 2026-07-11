import { Folder, type FolderProps } from '@bypass/shared';
import { useDisclosure } from '@mantine/hooks';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FolderEditIcon,
  FolderRemoveIcon,
  StarIcon,
  StarOffIcon,
} from '@hugeicons/core-free-icons';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props extends FolderProps {
  isDefault: boolean;
  handleRemove: (folderId: string) => void;
  toggleDefaultFolder: (folderId: string, newIsDefault: boolean) => void;
  handleEdit: (folderId: string, newName: string) => void;
}

function FolderRow({
  id,
  name: origName,
  isDefault,

  handleRemove,
  handleEdit,
  toggleDefaultFolder,
  ...restProps
}: Props) {
  const [openEditDialog, editDialogHandlers] = useDisclosure(false);

  const handleDeleteOptionClick = () => {
    handleRemove(id);
  };

  const handleDefaultOptionClick = () => {
    toggleDefaultFolder(id, !isDefault);
  };

  const handleFolderSave = (newName: string) => {
    handleEdit(id, newName);
  };

  const menuOptions: IMenuOption[] = [
    {
      onClick: editDialogHandlers.open,
      text: 'Edit',
      id: 'edit',
      icon: FolderEditIcon,
    },
    {
      onClick: handleDefaultOptionClick,
      text: isDefault ? 'Remove default' : 'Make default',
      id: isDefault ? 'remove-default' : 'make-default',
      icon: isDefault ? StarOffIcon : StarIcon,
    },
    {
      onClick: handleDeleteOptionClick,
      text: 'Delete',
      id: 'delete',
      icon: FolderRemoveIcon,
      variant: 'destructive',
    },
  ];

  return (
    <>
      <ContextMenu options={menuOptions}>
        <div className="relative size-full">
          <Folder id={id} name={origName} {...restProps} />
          {isDefault && (
            <div
              className="
                absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center
                text-yellow-500
              "
            >
              <HugeiconsIcon icon={StarIcon} className="size-4" />
            </div>
          )}
        </div>
      </ContextMenu>
      <FolderAddEditDialog
        headerText="Edit folder"
        origName={origName}
        handleSave={handleFolderSave}
        isOpen={openEditDialog}
        onClose={editDialogHandlers.close}
      />
    </>
  );
}

export default FolderRow;
