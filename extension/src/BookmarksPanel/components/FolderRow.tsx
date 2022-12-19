import Folder, {
  Props as FolderProps,
} from '@bypass/shared/components/Bookmarks/components/Folder';
import ContextMenu from 'GlobalComponents/ContextMenu';
import { IMenuOptions } from 'GlobalInterfaces/menu';
import withBookmarkRow from '../hoc/withBookmarkRow';
import { memo, useCallback, useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FaFolderMinus } from 'react-icons/fa';
import { FolderDialog } from './FolderDialog';

interface Props extends FolderProps {
  pos: number;
  handleRemove: (pos: number, origName: string) => void;
  handleEdit: (origName: string, newName: string, pos: number) => void;
}

const FolderRow = memo<Props>(
  ({ name: origName, pos, handleRemove, handleEdit, ...restProps }) => {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [menuOptions, setMenuOptions] = useState<IMenuOptions>([]);

    const toggleEditDialog = useCallback(() => {
      setOpenEditDialog(!openEditDialog);
    }, [openEditDialog]);

    const handleDeleteOptionClick = useCallback(() => {
      handleRemove(pos, origName);
    }, [handleRemove, origName, pos]);

    const handleFolderSave = (newName: string) => {
      handleEdit(origName, newName, pos);
      toggleEditDialog();
    };

    useEffect(() => {
      const menuOptions = [
        {
          onClick: toggleEditDialog,
          text: 'Edit',
          icon: AiFillEdit,
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          icon: FaFolderMinus,
        },
      ];
      setMenuOptions(menuOptions);
    }, [handleDeleteOptionClick, toggleEditDialog]);

    return (
      <>
        <ContextMenu
          getMenuOptions={() => menuOptions}
          containerStyles={{ display: 'flex', alignItems: 'center' }}
        >
          <Folder name={origName} {...restProps} />
        </ContextMenu>
        <FolderDialog
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
export default withBookmarkRow(FolderRow);
