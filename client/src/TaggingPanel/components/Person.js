import { Avatar, Box, IconButton, Typography } from "@material-ui/core";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import React, { memo, useEffect, useState } from "react";

const imageStyles = { width: 100, height: 100 };

const Person = memo(({ person }) => {
  const { name, imageRef, taggedUrls } = person;
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    getImageFromFirebase(imageRef).then((url) => {
      setImageUrl(url);
    });
  }, [imageRef]);

  return (
    <IconButton>
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4px 16px",
          cursor: "pointer",
        }}
      >
        <Avatar alt={name} src={imageUrl} sx={imageStyles} />
        <Typography>{name}</Typography>
      </Box>
    </IconButton>
  );
});

export default Person;
