import { Box, Button, SelectProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { displayToast } from 'GlobalActionCreators/toast';
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from 'GlobalComponents/AccordionHeader';
import Loader from 'GlobalComponents/Loader';
import PanelHeading from '@common/components/PanelHeading';
import Search from '@common/components/Search';
import { VoidFunction } from '@common/interfaces/custom';
import React, { memo, useEffect, useRef, useState } from 'react';
import { FaFolderPlus } from 'react-icons/fa';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { IoSave } from 'react-icons/io5';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import { TbReplace } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { ContextBookmarks } from '@common/components/Bookmarks/interfaces';
import { syncBookmarksFirebaseWithStorage } from '../utils/bookmark';
import { getBookmarksPanelUrl } from '@common/components/Bookmarks/utils/url';
import ConfirmationDialog from './ConfirmationDialog';
import { FolderDropdown } from './Dropdown';
import { FolderDialog } from './FolderDialog';
import ReplaceDialog from './ReplaceDialog';
import { useNavigate } from 'react-router-dom';

interface Props {
  isSaveButtonActive: boolean;
  contextBookmarks: ContextBookmarks;
  handleSave: VoidFunction;
  curFolder: string;
  folderNamesList: string[];
  isFetching: boolean;
  handleCreateNewFolder: (folder: string) => void;
  onSearchChange: (text: string) => void;
}

const Header = memo<Props>(function Header({
  isSaveButtonActive,
  contextBookmarks,
  handleSave,
  curFolder,
  folderNamesList,
  isFetching,
  handleCreateNewFolder,
  onSearchChange,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const onFolderChange: SelectProps<string>['onChange'] = (event) => {
    navigate(getBookmarksPanelUrl({ folderContext: event.target.value }));
  };

  const handleDiscardButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
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
      dispatch(displayToast({ message: 'Bookmarks synced succesfully' }));
    } catch (ex: any) {
      console.error('Bookmarks sync failed', ex);
      dispatch(
        displayToast({
          message: 'Bookmarks sync failed',
          severity: 'error',
        })
      );
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
      <AccordionHeader>
        <PrimaryHeaderContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              pl: '6px',
              '> *': { mr: '12px !important' },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<HiOutlineArrowNarrowLeft />}
              onClick={handleDiscardButtonClick}
              size="small"
              color="error"
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<FaFolderPlus />}
              onClick={handleNewFolderClick}
              size="small"
              color="primary"
            >
              Add
            </Button>
            <Button
              variant="outlined"
              startIcon={<TbReplace />}
              onClick={handleReplaceClick}
              size="small"
              color="primary"
            >
              Replace
            </Button>
            <Button
              variant="outlined"
              disabled={!isSaveButtonActive}
              startIcon={<IoSave />}
              onClick={onSaveClick}
              size="small"
              color="success"
              ref={saveButtonRef}
            >
              Save
            </Button>
            <LoadingButton
              variant="outlined"
              startIcon={<RiUploadCloud2Fill />}
              onClick={onSyncClick}
              size="small"
              color="warning"
              loading={isSyncing}
            >
              Sync
            </LoadingButton>
            {isFetching && <Loader />}
          </Box>
          <PanelHeading
            heading={`${curFolder} (${contextBookmarks?.length || 0})`}
            containerStyles={{ textTransform: 'uppercase' }}
          />
        </PrimaryHeaderContent>
        <SecondaryHeaderContent>
          <Box sx={{ minWidth: '190px' }}>
            <FolderDropdown
              folder={curFolder}
              folderList={folderNamesList}
              handleFolderChange={onFolderChange}
              hideLabel
              fullWidth
            />
          </Box>
          <Search onChange={onSearchChange} focusOnVisible />
        </SecondaryHeaderContent>
      </AccordionHeader>
      <FolderDialog
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

export default Header;
