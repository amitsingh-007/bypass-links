import { TextField } from "@material-ui/core";
import { EditDialog } from "GlobalComponents/Dialogs";
import { useState } from "react";

export const FolderDialog = ({
  origName = "",
  headerText,
  handleSave,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState(origName);

  const handleNameChange = (event) => {
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

  const isSaveOptionActive = name && name !== origName;
  return (
    <EditDialog
      headerText={headerText}
      openDialog={isOpen}
      closeDialog={handleClose}
      handleSave={handleSaveClick}
      isSaveOptionActive={isSaveOptionActive}
    >
      <TextField
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
