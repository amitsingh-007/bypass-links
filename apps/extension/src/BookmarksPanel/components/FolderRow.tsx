import ContextMenu, { IMenuOptions } from '@/components/ContextMenu';
import { Folder, FolderProps } from '@bypass/shared';
import { useMantineTheme } from '@mantine/core';
import { memo, useCallback, useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FaFolderMinus } from 'react-icons/fa';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props extends FolderProps {
  pos: number;
  handleRemove: (pos: number, origName: string) => void;
  handleEdit: (origName: string, newName: string, pos: number) => void;
}

const FolderRow = memo<Props>(
  ({ name: origName, pos, handleRemove, handleEdit, ...restProps }) => {
    const theme = useMantineTheme();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [menuOptions, setMenuOptions] = useState<IMenuOptions[]>([]);

    const toggleEditDialog = useCallback(() => {
      setOpenEditDialog((prev) => !prev);
    }, []);

    const handleDeleteOptionClick = useCallback(() => {
      handleRemove(pos, origName);
    }, [handleRemove, origName, pos]);

    const handleFolderSave = (newName: string) => {
      handleEdit(origName, newName, pos);
      toggleEditDialog();
    };

    useEffect(() => {
      const options = [
        {
          onClick: toggleEditDialog,
          text: 'Edit',
          icon: AiFillEdit,
          color: theme.colors.violet[9],
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          icon: FaFolderMinus,
          color: theme.colors.red[9],
        },
      ];
      setMenuOptions(options);
    }, [handleDeleteOptionClick, theme.colors, toggleEditDialog]);

    return (
      <>
        <ContextMenu options={menuOptions}>
          <Folder name={origName} {...restProps} />
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
FolderRow.displayName = 'FolderRow';

export type { Props };
export default FolderRow;
