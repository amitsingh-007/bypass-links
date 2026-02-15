import { Folder, type FolderProps } from '@bypass/shared';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FolderEditIcon,
  FolderRemoveIcon,
  StarIcon,
  StarOffIcon,
} from '@hugeicons/core-free-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props extends FolderProps {
  isDefault: boolean;
  handleRemove: (folderId: string) => void;
  toggleDefaultFolder: (folderId: string, newIsDefault: boolean) => void;
  handleEdit: (folderId: string, newName: string) => void;
}

const FolderRow = memo<Props>(
  ({
    id,
    name: origName,
    isDefault,

    handleRemove,
    handleEdit,
    toggleDefaultFolder,
    ...restProps
  }) => {
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const toggleEditDialog = useCallback(() => {
      setOpenEditDialog((prev) => !prev);
    }, []);

    const handleDeleteOptionClick = useCallback(() => {
      handleRemove(id);
    }, [handleRemove, id]);

    const handleDefaultOptionClick = useCallback(() => {
      toggleDefaultFolder(id, !isDefault);
    }, [id, isDefault, toggleDefaultFolder]);

    const handleFolderSave = (newName: string) => {
      handleEdit(id, newName);
    };

    const menuOptions = useMemo(() => {
      const options: IMenuOption[] = [
        {
          onClick: toggleEditDialog,
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
      return options;
    }, [
      handleDefaultOptionClick,
      handleDeleteOptionClick,
      isDefault,
      toggleEditDialog,
    ]);

    return (
      <>
        <ContextMenu options={menuOptions}>
          <div className="relative h-full w-full">
            <Folder id={id} name={origName} {...restProps} />
            {isDefault && (
              <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center text-yellow-500">
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
          onClose={toggleEditDialog}
        />
      </>
    );
  }
);

export type { Props };
export default FolderRow;
