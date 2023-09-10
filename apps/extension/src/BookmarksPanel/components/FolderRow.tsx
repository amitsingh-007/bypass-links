import ContextMenu, { IMenuOption } from '@/components/ContextMenu';
import { Folder, FolderProps } from '@bypass/shared';
import { Box, Flex, useMantineTheme } from '@mantine/core';
import { memo, useCallback, useMemo, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FaFolderMinus } from 'react-icons/fa';
import { PiStarBold, PiStarFill } from 'react-icons/pi';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props extends FolderProps {
  pos: number;
  isDefault: boolean;
  handleRemove: (pos: number, origName: string) => void;
  toggleDefaultFolder: (
    folder: string,
    newIsDefault: boolean,
    pos: number
  ) => void;
  handleEdit: (origName: string, newName: string, pos: number) => void;
}

const FolderRow = memo<Props>(
  ({
    name: origName,
    isDefault,
    pos,
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
      handleRemove(pos, origName);
    }, [handleRemove, origName, pos]);

    const handleDefaultOptionClick = useCallback(() => {
      toggleDefaultFolder(origName, !isDefault, pos);
    }, [isDefault, origName, pos, toggleDefaultFolder]);

    const handleFolderSave = (newName: string) => {
      handleEdit(origName, newName, pos);
      toggleEditDialog();
    };

    const menuOptions = useMemo(() => {
      const options: IMenuOption[] = [
        {
          onClick: toggleEditDialog,
          text: 'Edit',
          icon: AiFillEdit,
          color: theme.colors.violet[9],
        },
        {
          onClick: handleDefaultOptionClick,
          text: isDefault ? 'Remove default' : 'Make default',
          icon: isDefault ? PiStarFill : PiStarBold,
          color: isDefault ? theme.colors.yellow[5] : theme.colors.dark[3],
        },
        {
          onClick: handleDeleteOptionClick,
          text: 'Delete',
          icon: FaFolderMinus,
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
            <Folder name={origName} {...restProps} />
            {isDefault && (
              <Flex
                align="center"
                sx={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
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
FolderRow.displayName = 'FolderRow';

export type { Props };
export default FolderRow;
