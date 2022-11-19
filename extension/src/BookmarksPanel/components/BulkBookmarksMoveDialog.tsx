import { SelectProps } from '@mui/material';
import { EditDialog } from 'GlobalComponents/Dialogs';
import { VoidFunction } from '@common/interfaces/custom';
import { useState } from 'react';
import { FolderDropdown } from './Dropdown';

interface Props {
  origFolder: string;
  folderList: string[];
  handleSave: (folder: string) => void;
  isOpen: boolean;
  onClose: VoidFunction;
}

const BulkBookmarksMoveDialog: React.FC<Props> = ({
  origFolder,
  folderList,
  handleSave,
  isOpen,
  onClose,
}) => {
  const [folder, setFolder] = useState(origFolder);

  const handleFolderChange: SelectProps<string>['onChange'] = (event) => {
    setFolder(event.target.value);
  };

  const handleSaveClick = () => {
    handleSave(folder);
    onClose();
  };
  const handleClose = () => {
    setFolder(origFolder);
    onClose();
  };

  const isSaveOptionActive = folder !== origFolder;
  return (
    <EditDialog
      headerText="Move Selected Bookmarks"
      openDialog={isOpen}
      closeDialog={handleClose}
      handleSave={handleSaveClick}
      isSaveOptionActive={isSaveOptionActive}
    >
      <FolderDropdown
        folder={folder}
        folderList={folderList}
        handleFolderChange={handleFolderChange}
      />
    </EditDialog>
  );
};

export default BulkBookmarksMoveDialog;
