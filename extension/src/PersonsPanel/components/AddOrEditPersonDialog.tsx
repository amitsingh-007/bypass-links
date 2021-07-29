import { Avatar, Box, TextField } from "@material-ui/core";
import PersonOffIcon from "@material-ui/icons/PersonOff";
import { EditDialog } from "GlobalComponents/Dialogs";
import { VoidFunction } from "GlobalInterfaces/custom";
import { getImageFromFirebase } from "GlobalHelpers/firebase";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { resolveImageFromPersonId } from "../utils";
import ImagePicker from "./ImagePicker";
import { IPerson } from "@common/interfaces/person";

const imageStyles = { width: 200, height: 200 };

interface Props {
  person?: IPerson;
  isOpen: boolean;
  onClose: VoidFunction;
  handleSaveClick: (person: IPerson) => void;
}

const AddOrEditPersonDialog = memo<Props>(function AddOrEditPersonDialog({
  person,
  isOpen,
  onClose,
  handleSaveClick,
}) {
  const [personId, setPersonId] = useState(person?.id);
  const [name, setName] = useState(person?.name ?? "");
  const [imagePath, setImagePath] = useState(person?.imagePath);
  const [fullImageUrl, setFullImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const initImageUrl = async (id: string) => {
    const imageUrl = await resolveImageFromPersonId(id);
    setFullImageUrl(imageUrl);
  };

  useEffect(() => {
    if (person) {
      initImageUrl(person.id);
    } else {
      setPersonId(md5(Date.now().toString()));
    }
  }, [person]);

  const fetchImage = async (ref: string) => {
    const url = await getImageFromFirebase(ref);
    setFullImageUrl(url);
  };

  const handleNameChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    setName(event.target.value);
  };

  const handleImageCropSave = async (imageFirebaseRef: string) => {
    await fetchImage(imageFirebaseRef);
    setImagePath(imageFirebaseRef);
  };

  const toggleImagePicker = () => {
    setShowImagePicker(!showImagePicker);
  };

  const handlePersonSave = () => {
    if (!personId || !imagePath) return;
    handleSaveClick({
      id: personId,
      name,
      imagePath,
      taggedUrls: person?.taggedUrls || [],
    });
  };

  const isSaveActive = Boolean(name && fullImageUrl);

  return (
    <>
      <EditDialog
        headerText={person ? "Edit" : "Add a Person"}
        openDialog={isOpen}
        closeDialog={onClose}
        handleSave={handlePersonSave}
        isSaveOptionActive={isSaveActive}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Box onClick={toggleImagePicker} sx={{ cursor: "pointer" }}>
            <Avatar
              alt={fullImageUrl || "No Image"}
              src={fullImageUrl}
              sx={imageStyles}
            >
              {fullImageUrl ? null : <PersonOffIcon sx={{ fontSize: 125 }} />}
            </Avatar>
          </Box>
          <TextField
            autoFocus
            size="small"
            label="Name"
            variant="outlined"
            title={name}
            value={name}
            onChange={handleNameChange}
            style={{ marginTop: "20px" }}
          />
        </Box>
      </EditDialog>
      {personId && (
        <ImagePicker
          id={personId}
          isOpen={showImagePicker}
          onDialogClose={toggleImagePicker}
          handleImageSave={handleImageCropSave}
        />
      )}
    </>
  );
});

export default AddOrEditPersonDialog;
