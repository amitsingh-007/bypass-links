import { Box, Typography } from "@material-ui/core";
import FolderTwoToneIcon from "@material-ui/icons/FolderTwoTone";
import { displayToast } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { getBookmarksPanelUrl } from "../utils";
import { FolderDialog } from "./FormComponents";
import withBookmarkRow from "./withBookmarkRow";

const getTitleStyles = (isEmpty) => ({
  flexGrow: "1",
  marginLeft: "8px",
  color: isEmpty ? COLOR.blueGrey.color : "inherit",
});

const Folder = memo(
  ({
    name: origName,
    pos,
    handleRemove,
    handleEdit,
    renderMenu,
    isEmpty,
    containerStyles,
  }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const toggleEditDialog = () => {
      setOpenEditDialog(!openEditDialog);
    };

    const handleDeleteOptionClick = () => {
      handleRemove(pos, origName);
    };

    const handleFolderSave = (newName) => {
      handleEdit(origName, newName, pos);
      toggleEditDialog();
    };

    const handleFolderOpen = () => {
      if (isEmpty) {
        dispatch(displayToast({ message: "This folder is empty" }));
        return;
      }
      history.push(getBookmarksPanelUrl({ folder: origName }));
    };

    return (
      <>
        <Box
          onDoubleClick={handleFolderOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            ...containerStyles,
          }}
        >
          <FolderTwoToneIcon fontSize="small" htmlColor={COLOR.yellow.color} />
          <Typography noWrap style={getTitleStyles(isEmpty)}>
            {origName}
          </Typography>
        </Box>
        {renderMenu([
          { onClick: toggleEditDialog, text: "Edit" },
          { onClick: handleDeleteOptionClick, text: "Delete" },
        ])}
        <FolderDialog
          headerText="Edit folder"
          origName={origName}
          handleSave={handleFolderSave}
          isOpen={openEditDialog}
          onClose={toggleEditDialog}
        />
      </>
    );
  }
);

export default withBookmarkRow(Folder);
