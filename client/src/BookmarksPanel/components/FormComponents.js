import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import FormatColorTextTwoToneIcon from "@material-ui/icons/FormatColorTextTwoTone";
import runtime from "ChromeApi/runtime";
import { EditDialog } from "GlobalComponents/Dialogs";
import { COLOR } from "GlobalConstants/color";
import { useState } from "react";

export const FolderDropdown = ({
  folder,
  folderList,
  handleFolderChange,
  variant = "filled",
  hideLabel = false,
}) => {
  if (!folderList || folderList.length < 1) {
    return null;
  }
  return (
    <FormControl variant={variant} size="small" color="secondary">
      {!hideLabel ? <InputLabel id="folders">Folder</InputLabel> : null}
      <Select labelId="folders" value={folder} onChange={handleFolderChange}>
        {folderList.map((folder) => (
          <MenuItem key={folder} value={folder}>
            {folder}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const BookmarkDialog = ({
  url: origUrl,
  origTitle,
  origFolder,
  headerText,
  folderList,
  handleSave,
  handleDelete,
  isOpen,
  onClose,
  isSaveActive,
}) => {
  const [url] = useState(origUrl);
  const [title, setTitle] = useState(origTitle);
  const [folder, setFolder] = useState(origFolder);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };
  const handleFolderChange = (event) => {
    setFolder(event.target.value);
  };

  const handleSaveClick = () => {
    handleSave(url, title, folder);
    onClose();
  };
  const handleClose = () => {
    setTitle(origTitle);
    setFolder(origFolder);
    onClose();
  };
  const handleH1Click = async () => {
    const { pageH1 } = await runtime.sendMessage({ fetchPageH1: true });
    setTitle(pageH1);
  };

  const isSaveOptionActive =
    isSaveActive || (title && (title !== origTitle || folder !== origFolder));
  return (
    <EditDialog
      headerText={headerText}
      openDialog={isOpen}
      closeDialog={handleClose}
      handleSave={handleSaveClick}
      handleDelete={handleDelete}
      isSaveOptionActive={isSaveOptionActive}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <TextField
          size="small"
          label="Name"
          variant="filled"
          color="secondary"
          title={title}
          value={title}
          onChange={handleTitleChange}
          style={{ flexGrow: "1" }}
        />
        <IconButton
          aria-label="MakeH1asTitle"
          component="span"
          style={COLOR.blue}
          onClick={handleH1Click}
          title="Make H1 as Title"
        >
          <FormatColorTextTwoToneIcon fontSize="large" />
        </IconButton>
      </Box>
      <TextField
        size="small"
        label="Url"
        variant="filled"
        color="secondary"
        title={url}
        value={url}
        InputProps={{ readOnly: true }}
      />
      <FolderDropdown
        folder={folder}
        folderList={folderList}
        handleFolderChange={handleFolderChange}
      />
    </EditDialog>
  );
};

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
        variant="filled"
        color="secondary"
        title={name}
        value={name}
        onChange={handleNameChange}
      />
    </EditDialog>
  );
};

export const BulkBookmarksMoveDialog = ({
  origFolder,
  folderList,
  handleSave,
  isOpen,
  onClose,
}) => {
  const [folder, setFolder] = useState(origFolder);

  const handleFolderChange = (event) => {
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
