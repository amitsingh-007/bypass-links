import { Header } from '@bypass/shared';
import { Button } from '@bypass/ui';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { memo } from 'react';
import { BookmarkCheck01Icon, FolderAddIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useShallow } from 'zustand/react/shallow';
import useBookmarkStore from '../store/useBookmarkStore';
import ConfirmationDialog from './ConfirmationDialog';
import { FolderAddEditDialog } from './FolderAddEditDialog';

interface Props {
  onSearchChange: (text: string) => void;
  folderId: string;
}

const handleClose = () => {
  window.history.back();
};

const BookmarksHeader = memo<Props>(({ onSearchChange, folderId }) => {
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
  const [openFolderDialog, folderDialogHandlers] = useDisclosure(false);
  const [openConfirmationDialog, confirmationDialogHandlers] =
    useDisclosure(false);

  const disableSave = isFetching || !isSaveButtonActive;

  const handleSaveClick = () => {
    handleSave(folderId);
  };

  useHotkeys([
    [
      'mod+S',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disableSave) {
          handleSaveClick();
        }
      },
    ],
  ]);

  const onBackClick = () => {
    if (isSaveButtonActive) {
      confirmationDialogHandlers.open();
    } else {
      handleClose();
    }
  };

  const handleConfirmationDialogClose = confirmationDialogHandlers.close;

  const handleConfirmationDialogOk = () => {
    handleClose();
    confirmationDialogHandlers.close();
  };

  const handleNewFolderSave = (folderName: string) => {
    handleCreateNewFolder(folderName, folderId);
  };

  return (
    <>
      <Header
        text={contextBookmarks?.length || 0}
        onBackClick={onBackClick}
        onSearchChange={onSearchChange}
      >
        <Button
          variant="secondary"
          className="font-medium"
          disabled={isFetching}
          onClick={folderDialogHandlers.open}
        >
          <HugeiconsIcon icon={FolderAddIcon} className="mr-1 size-4" />
          Add
        </Button>
        <Button
          variant="default"
          className="font-medium"
          disabled={disableSave}
          onClick={handleSaveClick}
        >
          <HugeiconsIcon icon={BookmarkCheck01Icon} className="mr-1 size-4" />
          Save
        </Button>
      </Header>
      <FolderAddEditDialog
        headerText="Add folder"
        handleSave={handleNewFolderSave}
        isOpen={openFolderDialog}
        onClose={folderDialogHandlers.close}
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
