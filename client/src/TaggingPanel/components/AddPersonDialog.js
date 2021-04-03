import { Avatar, Box, TextField } from "@material-ui/core";
import { EditDialog } from "GlobalComponents/Dialogs";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import md5 from "md5";
import React, { memo, useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";

const imageStyles = { width: 200, height: 200 };

const AddPersonDialog = memo(({ isOpen, onClose, handleSaveClick }) => {
  const [uid, setUid] = useState(null);
  const [name, setName] = useState("");
  const [imageRef, setImageRef] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    setUid(md5(Date.now()));
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleImageCropSave = async (imageFirebaseRef) => {
    const url = await getImageFromFirebase(imageFirebaseRef);
    setImageRef(url);
  };

  const toggleImagePicker = () => {
    setShowImagePicker(!showImagePicker);
  };

  const handlePersonSave = () => {
    handleSaveClick({ uid, name, imageRef, taggedUrls: [] });
  };

  return (
    <>
      <EditDialog
        headerText="Add a Person"
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
              alt={imageRef || "No Image"}
              src={imageRef}
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
});

export default AddPersonDialog;
