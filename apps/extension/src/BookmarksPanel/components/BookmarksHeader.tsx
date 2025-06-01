import { Header } from '@bypass/shared';
import { Button } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { memo, useState } from 'react';
import { FaFolderPlus } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';
import { useShallow } from 'zustand/react/shallow';
import useBookmarkStore from '../store/useBookmarkStore';
import ConfirmationDialog from './ConfirmationDialog';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props {
  onSearchChange: (text: string) => void;
  folderContext: string;
}

const handleClose = () => {
  window.history.back();
};

const BookmarksHeader = memo<Props>(({ onSearchChange, folderContext }) => {
  const {
    contextBookmarks,
    isFetching,
    isSaveButtonActive,
    handleSave,
    handleCreateNewFolder,
  } = useBookmarkStore(
    useShallow((state) => ({
      contextBookmarks: state.contextBookmarks,
      isFetching: state.isFetching,
      isSaveButtonActive: state.isSaveButtonActive,
      handleSave: state.handleSave,
      handleCreateNewFolder: state.handleCreateNewFolder,
    }))
  );
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const disableSave = isFetching || !isSaveButtonActive;

  const handleSaveClick = () => {
    handleSave(folderContext);
  };

  useHotkeys([
    [
      'mod+s',
      (e) => {
        e.stopPropagation();
        if (!disableSave) {
          handleSaveClick();
        }
      },
    ],
  ]);

  const onBackClick = () => {
    if (isSaveButtonActive) {
      setOpenConfirmationDialog(true);
    } else {
      handleClose();
    }
  };

  const toggleNewFolderDialog = () => setOpenFolderDialog(!openFolderDialog);

  const handleConfirmationDialogClose = () => setOpenConfirmationDialog(false);

  const handleConfirmationDialogOk = () => {
    handleClose();
    setOpenConfirmationDialog(false);
  };

  const handleNewFolderSave = (folderName: string) => {
    handleCreateNewFolder(folderName, folderContext);
    toggleNewFolderDialog();
  };

  return (
    <>
      <Header
        text={contextBookmarks?.length || 0}
        onBackClick={onBackClick}
        onSearchChange={onSearchChange}
      >
        <Button
          size="xs"
          radius="xl"
          leftSection={<FaFolderPlus />}
          disabled={isFetching}
          onClick={toggleNewFolderDialog}
        >
          Add
        </Button>
        <Button
          size="xs"
          radius="xl"
          color="teal"
          leftSection={<IoSave />}
          disabled={disableSave}
          onClick={handleSaveClick}
        >
          Save
        </Button>
      </Header>
      <FolderAddEditDialog
        headerText="Add folder"
        handleSave={handleNewFolderSave}
        isOpen={openFolderDialog}
        onClose={toggleNewFolderDialog}
      />
      <ConfirmationDialog
        isOpen={openConfirmationDialog}
        onClose={handleConfirmationDialogClose}
        onOk={handleConfirmationDialogOk}
      />
    </>
  );
});

export default BookmarksHeader;
