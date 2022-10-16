import { TextField } from '@mui/material';
import { EditDialog } from 'GlobalComponents/Dialogs';
import { VoidFunction } from '@common/interfaces/custom';
import { useState } from 'react';

export const FolderDialog: React.FC<{
  origName?: string;
  headerText: string;
  handleSave: (name: string) => void;
  isOpen: boolean;
  onClose: VoidFunction;
}> = ({ origName = '', headerText, handleSave, isOpen, onClose }) => {
  const [name, setName] = useState(origName);

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setName(event.target.value);
  };

  const handleSaveClick = () => {
    handleSave(name);
    onClose();
  };
  const handleClose = () => {
    setName(origName);
    onClose();
  };

  const isSaveOptionActive = Boolean(name && name !== origName);
  return (
    <EditDialog
      headerText={headerText}
      openDialog={isOpen}
      closeDialog={handleClose}
      handleSave={handleSaveClick}
      isSaveOptionActive={isSaveOptionActive}
    >
      <TextField
        autoFocus
        size="small"
        label="Name"
        variant="outlined"
        title={name}
        value={name}
        onChange={handleNameChange}
      />
    </EditDialog>
  );
};
