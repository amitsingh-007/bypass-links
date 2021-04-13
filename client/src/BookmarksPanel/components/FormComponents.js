import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import FormatColorTextTwoToneIcon from "@material-ui/icons/FormatColorTextTwoTone";
import runtime from "ChromeApi/runtime";
import { EditDialog } from "GlobalComponents/Dialogs";
import { COLOR } from "GlobalConstants/color";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import { memo, useEffect, useState } from "react";
import { DEFAULT_PERSON_UID } from "SrcPath/TaggingPanel/constants";
import {
  getAllPersonNames,
  getPersonFromUid,
  getSortedPersons,
} from "SrcPath/TaggingPanel/utils";

const DEFAUT_PERSON_TEXT = "Select Person";

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

const getPersonSelectValue = (uid, name) => `${uid}|${name}`;

const getPersonsMenuItems = (persons) => {
  const menuItems = persons.map(({ uid, name, imageUrl }) => (
    <MenuItem key={uid} value={getPersonSelectValue(uid, name)}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar alt={name} src={imageUrl} />
        <Box component="span" sx={{ marginLeft: "10px" }}>
          {name}
        </Box>
      </Box>
    </MenuItem>
  ));
  menuItems.unshift(
    <MenuItem
      key={DEFAULT_PERSON_UID}
      value={getPersonSelectValue(DEFAULT_PERSON_UID, DEFAUT_PERSON_TEXT)}
    >
      <Avatar alt="None" />
      <Box component="span" sx={{ marginLeft: "10px" }}>
        {DEFAUT_PERSON_TEXT}
      </Box>
    </MenuItem>
  );
  return menuItems;
};

const PersonDropdown = memo(
  ({ personUid = DEFAULT_PERSON_UID, personList = [], handlePersonChange }) => {
    const selectedPerson = personList.find(
      (person) => personUid === person.uid
    );
    const sortedPersons = getSortedPersons(personList);
    const menuItems = getPersonsMenuItems(sortedPersons);
    return (
      <FormControl
        variant="filled"
        size="small"
        color="secondary"
        sx={{ width: "100%" }}
      >
        <InputLabel id="persons">Person</InputLabel>
        <Select
          labelId="persons"
          value={getPersonSelectValue(
            personUid,
            selectedPerson?.name ?? DEFAUT_PERSON_TEXT
          )}
          onChange={handlePersonChange}
          MenuProps={{ sx: { maxHeight: "270px" } }}
          renderValue={(selectedValue) => (
            <Box>{selectedValue.split("|")[1]}</Box>
          )}
        >
          {menuItems}
        </Select>
      </FormControl>
    );
  }
);

export const BookmarkDialog = ({
  url: origUrl,
  origTitle,
  origFolder,
  origPersonUid,
  headerText,
  folderList,
  handleSave,
  handleDelete,
  isOpen,
  onClose,
  isSaveActive,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [person, setPerson] = useState({});
  const [title, setTitle] = useState(origTitle);
  const [folder, setFolder] = useState(origFolder);
  const [personList, setPersonList] = useState([]);
  const [isFetchingPerson, setIsFetchingPerson] = useState(false);

  const initPerson = async (uid) => {
    const person = await getPersonFromUid(uid);
    if (person) {
      setIsFetchingPerson(true);
      const url =
        person.imageRef && (await getImageFromFirebase(person.imageRef));
      setImageUrl(url);
      setPerson(person);
      setIsFetchingPerson(false);
    }
  };

  const initPersonList = async () => {
    setIsFetchingPerson(true);
    const persons = await getAllPersonNames();
    if (persons) {
      const personsWithImageUrl = await Promise.all(
        persons.map(async (person) => {
          const imageUrl = await getImageFromFirebase(person.imageRef);
          return { ...person, imageUrl };
        })
      );
      setPersonList(personsWithImageUrl);
    }
    setIsFetchingPerson(false);
  };

  useEffect(() => {
    initPersonList();
    initPerson(origPersonUid);
  }, []);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };
  const handleFolderChange = (event) => {
    setFolder(event.target.value);
  };
  const handlePersonChange = (event) => {
    const uid = event.target.value.split("|")[0];
    initPerson(uid);
  };

  const handleSaveClick = () => {
    handleSave(origUrl, title, folder, person.uid);
    onClose();
  };

  const handleH1Click = async () => {
    const { pageH1 } = await runtime.sendMessage({ fetchPageH1: true });
    setTitle(pageH1);
  };

  const isSaveOptionActive =
    isSaveActive ||
    (title && (title !== origTitle || folder !== origFolder)) ||
    (!origPersonUid && person.uid) ||
    (origPersonUid && origPersonUid !== person.uid);

  return (
    <EditDialog
      headerText={headerText}
      openDialog={isOpen}
      closeDialog={onClose}
      handleSave={handleSaveClick}
      handleDelete={handleDelete}
      isSaveOptionActive={isSaveOptionActive}
    >
      {isFetchingPerson && <LinearProgress color="secondary" />}
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
        title={origUrl}
        value={origUrl}
        InputProps={{ readOnly: true }}
      />
      <FolderDropdown
        folder={folder}
        folderList={folderList}
        handleFolderChange={handleFolderChange}
      />
      <Box
        sx={{ display: "flex", alignItems: "center", margin: "8px 8px 0 0" }}
      >
        <PersonDropdown
          personUid={person.uid}
          personList={personList}
          handlePersonChange={handlePersonChange}
        />
        <Avatar
          alt={person.name}
          src={imageUrl}
          sx={{ width: "70px", height: "70px" }}
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
