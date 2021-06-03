import {
  Avatar,
  Badge,
  Box,
  IconButton,
  MenuItem,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { RightClickMenu } from "GlobalComponents/StyledComponents";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router";
import useMenu from "SrcPath/hooks/useMenu";
import { getPersonsPanelUrl, resolvePersonImageFromUid } from "../utils";
import AddOrEditPersonDialog from "./AddOrEditPersonDialog";
import BookmarksList from "./BookmarksList";

const imageStyles = { width: 100, height: 100 };

const Person = memo(
  ({ person, openBookmarksListUid, handleEditPerson, handlePersonDelete }) => {
    const { uid, name, taggedUrls } = person;
    const [imageUrl, setImageUrl] = useState("");
    const [showBookmarksList, setShowBookmarksList] = useState(false);
    const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();
    const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);
    const history = useHistory();

    useEffect(() => {
      resolvePersonImageFromUid(uid).then((url) => {
        setImageUrl(url);
      });
    }, [uid, person]);

    useEffect(() => {
      setShowBookmarksList(openBookmarksListUid === uid);
    }, [openBookmarksListUid, uid]);

    const toggleEditPersonDialog = () => {
      setShowEditPersonDialog(!showEditPersonDialog);
    };

    const handlePersonSave = (updatedPerson) => {
      handleEditPerson(updatedPerson);
      toggleEditPersonDialog();
    };

    const taggedUrlsCount =
      taggedUrls && !!taggedUrls.length ? taggedUrls.length : 0;

    const openBookmarksList = () => {
      history.push(getPersonsPanelUrl({ openBookmarksList: uid }));
    };

    return (
      <>
        <IconButton
          sx={{ padding: "0px" }}
          onClick={openBookmarksList}
          data-text={name}
          className="personContainer"
        >
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
                fontSize: "14px",
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
            <EditIcon sx={{ marginRight: "12px" }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handlePersonDelete(person);
              onMenuClose();
            }}
            disabled={taggedUrlsCount > 0}
          >
            <DeleteIcon sx={{ marginRight: "12px" }} />
            Delete
          </MenuItem>
        </RightClickMenu>
        {showBookmarksList && (
          <BookmarksList
            name={name}
            imageUrl={imageUrl}
            taggedUrls={taggedUrls}
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
  }
);

export default Person;
