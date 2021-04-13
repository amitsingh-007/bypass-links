import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
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
import { memo, useEffect, useState } from "react";
import {
  getAllDecodedPersons,
  getPersonsWithImageUrl,
  getSortedPersons,
} from "SrcPath/TaggingPanel/utils";

export const FolderDropdown = ({
  folder,
  folderList,
  handleFolderChange,
  hideLabel = false,
}) => {
  if (!folderList || folderList.length < 1) {
    return null;
  }
  return (
    <FormControl variant="outlined" size="small" color="secondary">
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

const PersonsDropdown = memo(
  ({ taggedPersons, personList = [], loading, handlePersonsChange }) => {
    const [inputText, setInputText] = useState("");

    const onUserInputChange = (_event, newInputValue) => {
      setInputText(newInputValue);
    };

    const renderUserInout = (params) => (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? (
                <CircularProgress
                  color="inherit"
                  size={20}
                  sx={{ marginRight: "35px" }}
                />
              ) : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
        placeholder="Select Person"
      />
    );

    const renderSelectedOptions = (value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          label={option.name}
          avatar={<Avatar src={option.imageUrl} alt={option.name} />}
          {...getTagProps({ index })}
        />
      ));

    const renderOptions = (props, option) => (
      <Box
        component="li"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        {...props}
      >
        <Avatar
          alt={option.name}
          src={option.imageUrl}
          sx={{ height: "25px", width: "25px" }}
        />
        <Box component="span" sx={{ marginLeft: "10px" }}>
          {option.name}
        </Box>
      </Box>
    );

    const sortedPersons = getSortedPersons(personList);
    return (
      <Autocomplete
        multiple
        fullWidth
        size="small"
        limitTags={2}
        loading={loading}
        options={sortedPersons}
        value={taggedPersons}
        onChange={handlePersonsChange}
        inputValue={inputText}
        onInputChange={onUserInputChange}
        getOptionLabel={(option) => option.name}
        renderInput={renderUserInout}
        renderOption={renderOptions}
        renderTags={renderSelectedOptions}
      />
    );
  }
);

export const BookmarkDialog = ({
  url: origUrl,
  origTitle,
  origFolder,
  origTaggedPersons,
  headerText,
  folderList,
  handleSave,
  handleDelete,
  isOpen,
  onClose,
  isSaveActive,
}) => {
  const [taggedPersons, setTaggedPersons] = useState([]);
  const [title, setTitle] = useState(origTitle);
  const [folder, setFolder] = useState(origFolder);
  const [personList, setPersonList] = useState([]);
  const [isFetchingPerson, setIsFetchingPerson] = useState(false);
  const [isSaveOptionActive, setIsSaveOptionActive] = useState(isSaveActive);

  const initPersonList = async () => {
    setIsFetchingPerson(true);
    const persons = await getAllDecodedPersons();
    const personsWithImageUrl = await getPersonsWithImageUrl(persons);
    setPersonList(personsWithImageUrl);
    if (origTaggedPersons) {
      const taggedPersons = personsWithImageUrl.filter((person) =>
        origTaggedPersons.includes(person.uid)
      );
      setTaggedPersons(taggedPersons);
    }
    setIsFetchingPerson(false);
  };

  useEffect(() => {
    initPersonList();
  }, []);

  const handleTitleChange = (event) => {
    const title = event.target.value;
    setTitle(title);
    setIsSaveOptionActive(title !== origTitle);
  };
  const handleFolderChange = (event) => {
    const folder = event.target.value;
    setFolder(folder);
    setIsSaveOptionActive(folder !== origFolder);
  };
  const handlePersonsChange = (_event, newValues) => {
    setTaggedPersons(newValues);
    setIsSaveOptionActive(true);
  };

  const handleSaveClick = () => {
    handleSave(
      origUrl,
      title,
      folder,
      taggedPersons.map(({ uid }) => uid)
    );
    onClose();
  };

  const handleH1Click = async () => {
    const { pageH1 } = await runtime.sendMessage({ fetchPageH1: true });
    setTitle(pageH1);
  };

  return (
    <EditDialog
      headerText={headerText}
      openDialog={isOpen}
      closeDialog={onClose}
      handleSave={handleSaveClick}
      handleDelete={handleDelete}
      isSaveOptionActive={isSaveOptionActive}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          label="Name"
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
        color="secondary"
        title={origUrl}
        value={origUrl}
        InputProps={{ readOnly: true }}
      />
      <FolderDropdown
        folder={folder}
        folderList={folderList}
        handleFolderChange={handleFolderChange}
      />
      <Box sx={{ paddingRight: "15px" }}>
        <PersonsDropdown
          taggedPersons={taggedPersons}
          personList={personList}
          loading={isFetchingPerson}
          handlePersonsChange={handlePersonsChange}
        />
      </Box>
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
