import { Header } from '@bypass/shared';
import { Button, LoadingOverlay } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import useToastStore from '@store/toast';
import { memo, useState } from 'react';
import { FaFolderPlus } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { useLocation } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import useBookmarkStore from '../store/useBookmarkStore';
import { syncBookmarksFirebaseWithStorage } from '../utils/bookmark';
import ConfirmationDialog from './ConfirmationDialog';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props {
  onSearchChange: (text: string) => void;
  folderContext: string;
}

const BookmarksHeader = memo<Props>(({ onSearchChange, folderContext }) => {
  const [, navigate] = useLocation();
  const displayToast = useToastStore((state) => state.displayToast);
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
  const [isSyncing, setIsSyncing] = useState(false);

  const disableSave = isFetching || !isSaveButtonActive;

  const handleSaveClick = () => {
    handleSave(folderContext);
  };

  useHotkeys([
    [
      'mod+s',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (!disableSave) {
          handleSaveClick();
        }
      },
    ],
  ]);

  const handleClose = () => {
    // navigate(-1);
    window.history.back();
  };

  const onBackClick = () => {
    if (isSaveButtonActive) {
      setOpenConfirmationDialog(true);
    } else {
      handleClose();
    }
  };

  const onSyncClick = async () => {
    if (isSyncing) {
      return;
    }
    setIsSyncing(true);
    try {
      await syncBookmarksFirebaseWithStorage();
      displayToast({ message: 'Bookmarks synced successfully' });
    } catch (ex: any) {
      console.error('Bookmarks sync failed', ex);
      displayToast({
        message: 'Bookmarks sync failed',
        severity: 'error',
      });
    }
    setIsSyncing(false);
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
        onBackClick={onBackClick}
        onSearchChange={onSearchChange}
        text={contextBookmarks?.length || 0}
      >
        <Button
          size="xs"
          radius="xl"
          leftSection={<FaFolderPlus />}
          onClick={toggleNewFolderDialog}
          disabled={isFetching || isSyncing}
        >
          Add
        </Button>
        <Button
          size="xs"
          radius="xl"
          color="teal"
          leftSection={<IoSave />}
          onClick={handleSaveClick}
          disabled={disableSave}
        >
          Save
        </Button>
        <Button
          size="xs"
          radius="xl"
          leftSection={<RiUploadCloud2Fill />}
          onClick={onSyncClick}
          color="yellow"
          loading={isSyncing}
          disabled={!isSyncing && isFetching}
        >
          Sync
        </Button>
      </Header>
      <FolderAddEditDialog
        headerText="Add folder"
        handleSave={handleNewFolderSave}
        isOpen={openFolderDialog}
        onClose={toggleNewFolderDialog}
      />
      <ConfirmationDialog
        onClose={handleConfirmationDialogClose}
        onOk={handleConfirmationDialogOk}
        isOpen={openConfirmationDialog}
      />
      <LoadingOverlay visible={isSyncing} />
    </>
  );
});
BookmarksHeader.displayName = 'BookmarksHeader';

export default BookmarksHeader;
