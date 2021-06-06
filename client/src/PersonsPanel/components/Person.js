import { Avatar, Badge, Box, IconButton, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ContextMenu from "GlobalComponents/ContextMenu";
import { memo, useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { getPersonsPanelUrl, resolvePersonImageFromUid } from "../utils";
import AddOrEditPersonDialog from "./AddOrEditPersonDialog";
import BookmarksList from "./BookmarksList";

const imageStyles = { width: 100, height: 100 };

const Person = memo(
  ({ person, openBookmarksListUid, handleEditPerson, handlePersonDelete }) => {
    const history = useHistory();
    const { uid, name, taggedUrls } = person;
    const [imageUrl, setImageUrl] = useState("");
    const [showBookmarksList, setShowBookmarksList] = useState(false);
    const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);
    const [menuOptions, setMenuOptions] = useState([]);

    const handleDeleteOptionClick = useCallback(() => {
      handlePersonDelete(person);
    }, [handlePersonDelete, person]);

    const toggleEditPersonDialog = useCallback(() => {
      setShowEditPersonDialog(!showEditPersonDialog);
    }, [showEditPersonDialog]);

    useEffect(() => {
      const menuOptions = [
        {
          onClick: toggleEditPersonDialog,
          text: "Edit",
          icon: EditIcon,
        },
        {
          onClick: handleDeleteOptionClick,
          text: "Delete",
          icon: DeleteIcon,
        },
      ];
      setMenuOptions(menuOptions);
    }, [handleDeleteOptionClick, toggleEditPersonDialog]);

    useEffect(() => {
      resolvePersonImageFromUid(uid).then((url) => {
        setImageUrl(url);
      });
    }, [uid, person]);

    useEffect(() => {
      setShowBookmarksList(openBookmarksListUid === uid);
    }, [openBookmarksListUid, uid]);

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
          sx={{ padding: "0px", width: "20%", margin: "10px 0px" }}
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
            <ContextMenu menuOptions={menuOptions}>
              <Badge
                badgeContent={taggedUrlsCount}
                color="primary"
                overlap="circular"
              >
                <Avatar alt={name} src={imageUrl} sx={imageStyles} />
              </Badge>
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
            </ContextMenu>
          </Box>
        </IconButton>
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
