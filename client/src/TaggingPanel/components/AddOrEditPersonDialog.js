import { Avatar, Box, TextField } from "@material-ui/core";
import { EditDialog } from "GlobalComponents/Dialogs";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";

const imageStyles = { width: 200, height: 200 };

const AddOrEditPersonDialog = memo(
  ({ person, isOpen, onClose, handleSaveClick }) => {
    const [uid, setUid] = useState(person?.uid);
    const [name, setName] = useState(person?.name ?? "");
    const [imageRef, setImageRef] = useState(person?.imageRef);
    const [imageUrl, setImageUrl] = useState("");
    const [showImagePicker, setShowImagePicker] = useState(false);

    useEffect(() => {
      if (person) {
        fetchImage(person.imageRef);
      } else {
        setUid(md5(Date.now()));
      }
    }, [person]);

    const fetchImage = async (ref) => {
      const url = await getImageFromFirebase(ref);
      setImageUrl(url);
    };

    const handleNameChange = (event) => {
      setName(event.target.value);
    };

    const handleImageCropSave = async (imageFirebaseRef) => {
      await fetchImage(imageFirebaseRef);
      setImageRef(imageFirebaseRef);
    };

    const toggleImagePicker = () => {
      setShowImagePicker(!showImagePicker);
    };

    const handlePersonSave = () => {
      handleSaveClick({
        uid,
        name,
        imageRef,
        taggedUrls: person?.taggedUrls || [],
      });
    };

    return (
      <>
        <EditDialog
          headerText={person ? "Edit" : "Add a Person"}
          openDialog={isOpen}
          closeDialog={onClose}
          handleSave={handlePersonSave}
          isSaveOptionActive
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
              />
            </Box>
            <TextField
              size="small"
              label="Name"
              variant="filled"
              color="secondary"
              title={name}
              value={name}
              onChange={handleNameChange}
              style={{ marginTop: "20px" }}
            />
          </Box>
        </EditDialog>
        <ImagePicker
          uid={uid}
          isOpen={showImagePicker}
          onDialogClose={toggleImagePicker}
          handleImageSave={handleImageCropSave}
        />
      </>
    );
  }
);

export default AddOrEditPersonDialog;
