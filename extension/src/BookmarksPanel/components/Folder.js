import { Box, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import FolderTwoToneIcon from "@material-ui/icons/FolderTwoTone";
import { displayToast } from "GlobalActionCreators/toast";
import ContextMenu from "GlobalComponents/ContextMenu";
import { COLOR } from "GlobalConstants/color";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { BOOKMARK_ROW_DIMENTSIONS } from "../constants";
import { getBookmarksPanelUrl } from "../utils";
import { FolderDialog } from "./FolderDialog";
import withBookmarkRow from "./withBookmarkRow";

const getTitleStyles = (isEmpty) => ({
  flexGrow: "1",
  marginLeft: "8px",
  color: isEmpty ? COLOR.blueGrey.color : "inherit",
  fontSize: "14px",
});

const Folder = memo(
  ({
    name: origName,
    pos,
    handleRemove,
    handleEdit,
    isEmpty,
    containerStyles,
    resetSelectedBookmarks,
  }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [menuOptions, setMenuOptions] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const toggleEditDialog = useCallback(() => {
      setOpenEditDialog(!openEditDialog);
    }, [openEditDialog]);

    const handleDeleteOptionClick = useCallback(() => {
      handleRemove(pos, origName);
    }, [handleRemove, origName, pos]);

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

    useEffect(() => {
      const menuOptions = [
        {
          onClick: toggleEditDialog,
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
    }, [handleDeleteOptionClick, toggleEditDialog]);

    return (
      <>
        <ContextMenu menuOptions={menuOptions}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${BOOKMARK_ROW_DIMENTSIONS.height}px`,
              ...containerStyles,
            }}
            onClick={resetSelectedBookmarks}
            onDoubleClick={handleFolderOpen}
          >
            <FolderTwoToneIcon
              fontSize="small"
              htmlColor={COLOR.yellow.color}
            />
            <Typography noWrap style={getTitleStyles(isEmpty)}>
              {origName}
            </Typography>
          </Box>
        </ContextMenu>
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
