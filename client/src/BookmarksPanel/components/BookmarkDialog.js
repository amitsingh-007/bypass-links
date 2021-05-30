import { Box, IconButton, TextField } from "@material-ui/core";
import FormatColorTextTwoToneIcon from "@material-ui/icons/FormatColorTextTwoTone";
import runtime from "ChromeApi/runtime";
import { EditDialog } from "GlobalComponents/Dialogs";
import { COLOR } from "GlobalConstants/color";
import { useEffect, useState } from "react";
import {
  getAllDecodedPersons,
  getPersonsWithImageUrl,
} from "SrcPath/PersonsPanel/utils";
import { FolderDropdown, PersonsDropdown } from "./Dropdown";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
