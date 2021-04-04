import {
  Avatar,
  Box,
  Checkbox,
  makeStyles,
  Typography,
} from "@material-ui/core";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import {
  BlackTooltip,
  CircularTooltip,
} from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
import { getImageFromFirebase } from "GlobalUtils/firebase";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getBookmarksPanelUrl,
  getFaviconUrl,
} from "SrcPath/BookmarksPanel/utils";
import { getPersonFromUid } from "SrcPath/TaggingPanel/utils";
import { BookmarkDialog } from "./FormComponents";
import withBookmarkRow from "./withBookmarkRow";

const titleStyles = { flexGrow: "1" };
const tooltipStyles = { fontSize: "13px" };
const useStyles = makeStyles({
  root: { padding: "unset" },
});

const PersonImage = ({ imageUrl }) => {
  const avatar = (
    <Avatar
      alt={imageUrl}
      src={imageUrl}
      sx={{ width: "23px", height: "23px", marginRight: "8px" }}
    />
  );
  return imageUrl ? (
    <CircularTooltip
      title={
        <Avatar
          alt={imageUrl}
          src={imageUrl}
          sx={{ width: "70px", height: "70px" }}
        />
      }
      arrow
      disableInteractive
    >
      {avatar}
    </CircularTooltip>
  ) : (
    avatar
  );
};

const Bookmark = memo(
  ({
    url,
    title: origTitle,
    folder: origFolder,
    personUid: origPersonUid,
    pos,
    isSelected,
    folderNamesList,
    handleSave,
    handleRemove,
    handleSelectedChange,
    renderMenu,
    editBookmark,
    containerStyles,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [imageUrl, setImageUrl] = useState("");
    const [openEditDialog, setOpenEditDialog] = useState(editBookmark);

    const initImageUrl = async () => {
      const person = await getPersonFromUid(origPersonUid);
      const url =
        person.imageRef && (await getImageFromFirebase(person.imageRef));
      setImageUrl(url);
    };

    useEffect(() => {
      initImageUrl();
    }, []);

    const toggleEditDialog = () => {
      setOpenEditDialog(!openEditDialog);
    };

    const handleBookmarkSave = (url, newTitle, newFolder, newPerson) => {
      handleSave(
        url,
        newTitle,
        origFolder,
        newFolder,
        pos,
        origPersonUid,
        newPerson
      );
      //Remove qs before closing
      if (editBookmark && openEditDialog) {
        history.replace(getBookmarksPanelUrl({ folder: origFolder }));
      }
      toggleEditDialog();
    };
    const handleOpenLink = () => {
      dispatch(startHistoryMonitor());
      tabs.create({ url, selected: false });
    };
    const handleDeleteOptionClick = () => {
      handleRemove(pos, url);
    };
    const handleSelectionChange = () => {
      handleSelectedChange(pos);
    };

    const checkboxClasses = useStyles();
    return (
      <>
        <Box
          onDoubleClick={handleOpenLink}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            ...containerStyles,
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={handleSelectionChange}
            style={COLOR.pink}
            disableRipple
            classes={{ root: checkboxClasses.root }}
          />
          <Box
            component="img"
            src={getFaviconUrl(url)}
            sx={{
              width: "20px",
              height: "20px",
              marginLeft: "6px",
              marginRight: "8px",
            }}
          />
          <PersonImage imageUrl={imageUrl} />
          <BlackTooltip
            title={<Typography style={tooltipStyles}>{url}</Typography>}
            arrow
            disableInteractive
          >
            <Typography noWrap style={titleStyles}>
              {origTitle}
            </Typography>
          </BlackTooltip>
        </Box>
        {renderMenu([
          { onClick: handleOpenLink, text: "Open in new tab" },
          { onClick: toggleEditDialog, text: "Edit" },
          { onClick: handleDeleteOptionClick, text: "Delete" },
        ])}
        {openEditDialog && (
          <BookmarkDialog
            url={url}
            origTitle={origTitle}
            origFolder={origFolder}
            origPersonUid={origPersonUid}
            headerText="Edit bookmark"
            folderList={folderNamesList}
            handleSave={handleBookmarkSave}
            handleDelete={handleDeleteOptionClick}
            isOpen={openEditDialog}
            onClose={toggleEditDialog}
          />
        )}
      </>
    );
  }
);

export default withBookmarkRow(Bookmark);
