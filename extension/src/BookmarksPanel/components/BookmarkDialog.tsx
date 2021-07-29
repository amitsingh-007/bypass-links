import { Box, IconButton, SelectProps, TextField } from "@material-ui/core";
import FormatColorTextTwoToneIcon from "@material-ui/icons/FormatColorTextTwoTone";
import { EditDialog } from "GlobalComponents/Dialogs";
import { COLOR } from "GlobalConstants/color";
import runtime from "GlobalHelpers/chrome/runtime";
import { getPersons } from "GlobalHelpers/fetchFromStorage";
import { VoidFunction } from "GlobalInterfaces/custom";
import { useEffect, useState } from "react";
import { SORT_ORDER } from "SrcPath/PersonsPanel/constants/sort";
import { IPersonWithImage } from "SrcPath/PersonsPanel/interfaces/persons";
import { getPersonsWithImageUrl } from "SrcPath/PersonsPanel/utils";
import { sortAlphabetically } from "SrcPath/PersonsPanel/utils/sort";
import { FolderDropdown, PersonsDropdown } from "./Dropdown";

interface Props {
  url: string;
  origTitle: string;
  origFolder: string;
  origTaggedPersons?: string[];
  headerText: string;
  folderList: string[];
  handleSave: (
    origUrl: string,
    title: string,
    folder: string,
    taggedPersons: string[]
  ) => void;
  handleDelete?: VoidFunction;
  isOpen: boolean;
  onClose: VoidFunction;
  isSaveActive?: boolean;
}

const BookmarkDialog: React.FC<Props> = ({
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
  isSaveActive = false,
}) => {
  const [taggedPersons, setTaggedPersons] = useState<IPersonWithImage[]>([]);
  const [title, setTitle] = useState(origTitle);
  const [folder, setFolder] = useState(origFolder);
  const [personList, setPersonList] = useState<IPersonWithImage[]>([]);
  const [isFetchingPerson, setIsFetchingPerson] = useState(false);
  const [isSaveOptionActive, setIsSaveOptionActive] = useState(isSaveActive);

  const initPersonList = async () => {
    setIsFetchingPerson(true);
    const persons = await getPersons();
    const personsWithImageUrl = await getPersonsWithImageUrl(persons);
    setPersonList(sortAlphabetically(SORT_ORDER.asc, personsWithImageUrl));
    if (origTaggedPersons) {
      const taggedPersons = personsWithImageUrl.filter((person) =>
        origTaggedPersons.includes(person.id)
      );
      setTaggedPersons(taggedPersons);
    }
    setIsFetchingPerson(false);
  };

  useEffect(() => {
    initPersonList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const title = event.target.value;
    setTitle(title);
    setIsSaveOptionActive(title !== origTitle);
  };
  const handleFolderChange: SelectProps<string>["onChange"] = (event) => {
    const folder = event.target.value;
    setFolder(folder);
    setIsSaveOptionActive(folder !== origFolder);
  };
  const handlePersonsChange = (_event: any, newValues: IPersonWithImage[]) => {
    setTaggedPersons(newValues);
    setIsSaveOptionActive(true);
  };

  const handleSaveClick = () => {
    handleSave(
      origUrl,
      title,
      folder,
      taggedPersons.map(({ id }) => id)
    );
    onClose();
  };

  const handleH1Click = async () => {
    const { pageH1 } = await runtime.sendMessage<{ pageH1: string }>({
      fetchPageH1: true,
    });
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
          style={{ flexGrow: 1 }}
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

export default BookmarkDialog;
