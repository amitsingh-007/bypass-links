import { ContextBookmarks } from '@bypass/shared/components/Bookmarks/interfaces';
import Header from '@bypass/shared/components/Header';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { Button } from '@mantine/core';
import useToastStore from '@store/toast';
import React, { memo, useEffect, useRef, useState } from 'react';
import { FaFolderPlus } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { TbReplace } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { syncBookmarksFirebaseWithStorage } from '../utils/bookmark';
import ConfirmationDialog from './ConfirmationDialog';
import { FolderAddEditDialog } from './FolderAddEditDialog';
import ReplaceDialog from './ReplaceDialog';

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
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [openReplaceDialog, setOpenReplaceDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isSaveButtonActive) {
      //Focus save button after updating bookmarks
      setTimeout(() => {
        saveButtonRef?.current?.focus();
      }, 0);
    }
  }, [isSaveButtonActive, contextBookmarks]);

  const handleClose = () => {
    navigate(-1);
  };

  const onBackClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    if (isSaveButtonActive) {
      setOpenConfirmationDialog(true);
    } else {
      handleClose();
    }
  };

  const onSyncClick: React.MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.stopPropagation();
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

  const onSaveClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    handleSave();
  };

  const toggleNewFolderDialog = () => setOpenFolderDialog(!openFolderDialog);

  const toggleReplaceDialog = () => setOpenReplaceDialog(!openReplaceDialog);

  const handleNewFolderClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    toggleNewFolderDialog();
  };

  const handleReplaceClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    toggleReplaceDialog();
  };

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
          onClick={handleNewFolderClick}
          disabled={isFetching || isSyncing}
        >
          Add
        </Button>
        <Button
          radius="xl"
          variant="light"
          leftIcon={<TbReplace />}
          onClick={handleReplaceClick}
          disabled={isFetching || isSyncing}
        >
          Replace
        </Button>
        <Button
          radius="xl"
          variant="light"
          color="teal"
          leftIcon={<IoSave />}
          onClick={onSaveClick}
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
      {openReplaceDialog && <ReplaceDialog onClose={toggleReplaceDialog} />}
      <ConfirmationDialog
        onClose={handleConfirmationDialogClose}
        onOk={handleConfirmationDialogOk}
        isOpen={openConfirmationDialog}
      />
    </>
  );
});

export default BookmarksHeader;
