import { ContextBookmarks, Header, VoidFunction } from '@bypass/shared';
import { Button, LoadingOverlay } from '@mantine/core';
import useToastStore from '@store/toast';
import { memo, useState } from 'react';
import { FaFolderPlus } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { syncBookmarksFirebaseWithStorage } from '../utils/bookmark';
import ConfirmationDialog from './ConfirmationDialog';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props {
  isSaveButtonActive: boolean;
  contextBookmarks: ContextBookmarks;
  handleSave: VoidFunction;
  isFetching: boolean;
  handleCreateNewFolder: (folder: string) => void;
  onSearchChange: (text: string) => void;
}

const BookmarksHeader = memo<Props>(function BookmarksHeader({
  isSaveButtonActive,
  contextBookmarks,
  handleSave,
  isFetching,
  handleCreateNewFolder,
  onSearchChange,
}) {
  const navigate = useNavigate();
  const displayToast = useToastStore((state) => state.displayToast);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleClose = () => {
    navigate(-1);
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
      displayToast({ message: 'Bookmarks synced succesfully' });
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
    handleCreateNewFolder(folderName);
    toggleNewFolderDialog();
  };

  return (
    <>
      <Header
        onBackClick={onBackClick}
        onSearchChange={onSearchChange}
        text={`${contextBookmarks?.length || 0}`}
      >
        <Button
          radius="xl"
          variant="light"
          leftIcon={<FaFolderPlus />}
          onClick={toggleNewFolderDialog}
          disabled={isFetching || isSyncing}
        >
          Add
        </Button>
        <Button
          radius="xl"
          variant="light"
          color="teal"
          leftIcon={<IoSave />}
          onClick={handleSave}
          disabled={isFetching || !isSaveButtonActive}
        >
          Save
        </Button>
        <Button
          radius="xl"
          variant="light"
          leftIcon={<RiUploadCloud2Fill />}
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

export default BookmarksHeader;
