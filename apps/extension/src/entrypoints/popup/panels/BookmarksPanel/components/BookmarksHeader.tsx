import { Header } from '@bypass/shared';
import { Button } from '@bypass/ui';
import { useKeyPress } from 'ahooks';
import { memo, useRef, useState } from 'react';
import { FaFolderPlus } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';
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
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const disableSave = isFetching || !isSaveButtonActive;

  const handleSaveClick = () => {
    handleSave(folderId);
  };

  useKeyPress('meta.s', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disableSave) {
      handleSaveClick();
    }
  });

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
    handleCreateNewFolder(folderName, folderId);
    toggleNewFolderDialog();
  };

  return (
    <>
      <Header
        text={contextBookmarks?.length || 0}
        searchInputRef={searchInputRef}
        onBackClick={onBackClick}
        onSearchChange={onSearchChange}
      >
        <Button
          variant="outline"
          disabled={isFetching}
          onClick={toggleNewFolderDialog}
        >
          <FaFolderPlus className="mr-1 size-4" />
          Add
        </Button>
        <Button
          variant="default"
          disabled={disableSave}
          onClick={handleSaveClick}
        >
          <IoSave className="mr-1 size-4" />
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
