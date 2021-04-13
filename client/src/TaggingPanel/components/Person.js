import {
  Avatar,
  Badge,
  Box,
  IconButton,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { RightClickMenu } from "GlobalComponents/StyledComponents";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import { memo, useEffect, useState } from "react";
import useMenu from "SrcPath/hooks/useMenu";
import AddOrEditPersonDialog from "./AddOrEditPersonDialog";
import BookmarksList from "./BookmarksList";

const imageStyles = { width: 100, height: 100 };

const Person = memo(({ person, handleEditPerson }) => {
  const { name, imageRef, taggedUrls } = person;
  const [imageUrl, setImageUrl] = useState("");
  const [showBookmarksList, setShowBookmarksList] = useState(false);
  const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();
  const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);

  useEffect(() => {
    getImageFromFirebase(imageRef).then((url) => {
      setImageUrl(url);
    });
  }, [person, imageRef]);

  const toggleEditPersonDialog = () => {
    setShowEditPersonDialog(!showEditPersonDialog);
  };

  const handlePersonSave = (updatedPerson) => {
    handleEditPerson(updatedPerson);
    toggleEditPersonDialog();
  };

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
            height: "156px",
            width: "156px",
          }}
        >
          <Box onContextMenu={onMenuOpen}>
            <Badge
              badgeContent={taggedUrlsCount}
              color="primary"
              overlap="circular"
            >
              <Avatar alt={name} src={imageUrl} sx={imageStyles} />
            </Badge>
          </Box>
          <Typography
            sx={{
              width: "110px",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
            title={name}
          >
            {name}
          </Typography>
        </Box>
      </IconButton>
      <RightClickMenu
        open={isMenuOpen}
        onClose={onMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={menuPos}
      >
        <MenuItem
          onClick={() => {
            toggleEditPersonDialog();
            onMenuClose();
          }}
        >
          Edit
        </MenuItem>
      </RightClickMenu>
      {showBookmarksList && (
        <BookmarksList
          name={name}
          imageUrl={imageUrl}
          taggedUrls={taggedUrls}
          handleClose={toggleBookmarksList}
        />
      )}
      {showEditPersonDialog && (
        <AddOrEditPersonDialog
          person={person}
          isOpen={showEditPersonDialog}
          onClose={toggleEditPersonDialog}
          handleSaveClick={handlePersonSave}
        />
      )}
    </>
  );
});

export default Person;
