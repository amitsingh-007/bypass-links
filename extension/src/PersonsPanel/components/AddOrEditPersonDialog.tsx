import { Avatar, Box, TextField } from "@material-ui/core";
import PersonOffIcon from "@material-ui/icons/PersonOff";
import { EditDialog } from "GlobalComponents/Dialogs";
import { getImageFromFirebase } from "GlobalHelpers/firebase/storage";
import { VoidFunction } from "GlobalInterfaces/custom";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { IPerson } from "../interfaces/persons";
import { resolvePersonImageFromUid } from "../utils";
import ImagePicker from "./ImagePicker";

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
  const [uid, setUid] = useState(person?.uid);
  const [name, setName] = useState(person?.name ?? "");
  const [imageRef, setImageRef] = useState(person?.imageRef);
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const initImageUrl = async (uid: string) => {
    const imageUrl = await resolvePersonImageFromUid(uid);
    setImageUrl(imageUrl);
  };

  useEffect(() => {
    if (person) {
      initImageUrl(person.uid);
    } else {
      setUid(md5(Date.now().toString()));
    }
  }, [person]);

  const fetchImage = async (ref: string) => {
    const url = await getImageFromFirebase(ref);
    setImageUrl(url);
  };

  const handleNameChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    setName(event.target.value);
  };

  const handleImageCropSave = async (imageFirebaseRef: string) => {
    await fetchImage(imageFirebaseRef);
    setImageRef(imageFirebaseRef);
  };

  const toggleImagePicker = () => {
    setShowImagePicker(!showImagePicker);
  };

  const handlePersonSave = () => {
    if (!uid || !imageRef) return;
    handleSaveClick({
      uid,
      name,
      imageRef,
      taggedUrls: person?.taggedUrls || [],
    });
  };

  const isSaveActive = Boolean(name && imageUrl);

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
              alt={imageUrl || "No Image"}
              src={imageUrl}
              sx={imageStyles}
            >
              {imageUrl ? null : <PersonOffIcon sx={{ fontSize: 125 }} />}
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
      {uid && (
        <ImagePicker
          uid={uid}
          isOpen={showImagePicker}
          onDialogClose={toggleImagePicker}
          handleImageSave={handleImageCropSave}
        />
      )}
    </>
  );
});

export default AddOrEditPersonDialog;
