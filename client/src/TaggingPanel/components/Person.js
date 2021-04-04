import { Avatar, Badge, Box, IconButton, Typography } from "@material-ui/core";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import React, { memo, useEffect, useState } from "react";
import BookmarksList from "./BookmarksList";

const imageStyles = { width: 100, height: 100 };

const Person = memo(({ person }) => {
  const { name, imageRef, taggedUrls } = person;
  const [imageUrl, setImageUrl] = useState("");
  const [showBookmarksList, setShowBookmarksList] = useState(false);

  useEffect(() => {
    getImageFromFirebase(imageRef).then((url) => {
      setImageUrl(url);
    });
  }, [imageRef]);

  const taggedUrlsCount =
    taggedUrls && !!taggedUrls.length ? taggedUrls.length : 0;

  const toggleBookmarksList = () => {
    setShowBookmarksList(!showBookmarksList);
  };

  return (
    <>
      <IconButton onClick={toggleBookmarksList}>
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "4px 16px",
            cursor: "pointer",
          }}
        >
          <Badge
            badgeContent={taggedUrlsCount}
            color="primary"
            overlap="circular"
          >
            <Avatar alt={name} src={imageUrl} sx={imageStyles} />
          </Badge>
          <Typography>{name}</Typography>
        </Box>
      </IconButton>
      {showBookmarksList && (
        <BookmarksList
          name={name}
          imageUrl={imageUrl}
          taggedUrls={taggedUrls}
          handleClose={toggleBookmarksList}
        />
      )}
    </>
  );
});

export default Person;
