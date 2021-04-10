import { Box, MenuItem, Typography } from "@material-ui/core";
import FolderTwoToneIcon from "@material-ui/icons/FolderTwoTone";
import { displayToast } from "GlobalActionCreators/";
import { BlackMenu } from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import useMenu from "SrcPath/hooks/useMenu";
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
    isEmpty,
    containerStyles,
  }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

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

    const menuOptionsList = [
      { onClick: toggleEditDialog, text: "Edit" },
      { onClick: handleDeleteOptionClick, text: "Delete" },
    ];

    return (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            ...containerStyles,
          }}
          onDoubleClick={handleFolderOpen}
          onContextMenu={onMenuOpen}
        >
          <FolderTwoToneIcon fontSize="small" htmlColor={COLOR.yellow.color} />
          <Typography noWrap style={getTitleStyles(isEmpty)}>
            {origName}
          </Typography>
        </Box>
        <FolderDialog
          headerText="Edit folder"
          origName={origName}
          handleSave={handleFolderSave}
          isOpen={openEditDialog}
          onClose={toggleEditDialog}
        />
        <BlackMenu
          open={isMenuOpen}
          onClose={onMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={menuPos}
        >
          {menuOptionsList.map(({ text, onClick }) => (
            <MenuItem
              key={text}
              onClick={() => {
                onClick();
                onMenuClose();
              }}
            >
              {text}
            </MenuItem>
          ))}
        </BlackMenu>
      </>
    );
  }
);

export default withBookmarkRow(Folder);
