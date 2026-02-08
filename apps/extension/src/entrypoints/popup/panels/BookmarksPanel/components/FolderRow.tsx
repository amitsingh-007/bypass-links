import { Folder, type FolderProps } from '@bypass/shared';
import { Box, Flex, useMantineTheme } from '@mantine/core';
import { memo, useCallback, useMemo, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import { PiStarBold, PiStarFill } from 'react-icons/pi';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import { FolderAddEditDialog } from './FolderAddEditDialog';
import styles from './styles/FolderRow.module.css';

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
    const theme = useMantineTheme();
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
      toggleEditDialog();
    };

    const menuOptions = useMemo(() => {
      const options: IMenuOption[] = [
        {
          onClick: toggleEditDialog,
          text: 'Edit',
          id: 'edit',
          icon: AiFillEdit,
          color: theme.colors.violet[9],
        },
        {
          onClick: handleDefaultOptionClick,
          text: isDefault ? 'Remove default' : 'Make default',
          id: isDefault ? 'remove-default' : 'make-default',
          icon: isDefault ? PiStarFill : PiStarBold,
          color: isDefault ? theme.colors.yellow[5] : theme.colors.dark[3],
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          id: 'delete',
          icon: MdOutlineDelete,
          color: theme.colors.red[9],
        },
      ];
      return options;
    }, [
      handleDefaultOptionClick,
      handleDeleteOptionClick,
      isDefault,
      theme.colors,
      toggleEditDialog,
    ]);

    return (
      <>
        <ContextMenu options={menuOptions}>
          <Box w="100%" h="100%" pos="relative">
            <Folder id={id} name={origName} {...restProps} />
            {isDefault && (
              <Flex align="center" className={styles.defaultIcon}>
                <PiStarFill color={theme.colors.yellow[5]} />
              </Flex>
            )}
          </Box>
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
