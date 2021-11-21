import { Box, SvgIcon, Typography } from "@mui/material";
import { displayToast } from "GlobalActionCreators/toast";
import ContextMenu from "GlobalComponents/ContextMenu";
import { MenuOption } from "GlobalInterfaces/menu";
import { memo, useCallback, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { FaFolderMinus } from "react-icons/fa";
import { FcFolder } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import withBookmarkRow, { InjectedProps } from "../hoc/withBookmarkRow";
import { getBookmarksPanelUrl } from "../utils/url";
import { FolderDialog } from "./FolderDialog";

export interface Props extends InjectedProps {
  name: string;
  pos: number;
  handleRemove: (pos: number, origName: string) => void;
  handleEdit: (origName: string, newName: string, pos: number) => void;
  isEmpty: boolean;
  resetSelectedBookmarks: React.MouseEventHandler<HTMLDivElement>;
}

const Folder = memo<Props>(function Folder({
  name: origName,
  pos,
  handleRemove,
  handleEdit,
  isEmpty,
  containerStyles,
  resetSelectedBookmarks,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const toggleEditDialog = useCallback(() => {
    setOpenEditDialog(!openEditDialog);
  }, [openEditDialog]);

  const handleDeleteOptionClick = useCallback(() => {
    handleRemove(pos, origName);
  }, [handleRemove, origName, pos]);

  const handleFolderSave = (newName: string) => {
    handleEdit(origName, newName, pos);
    toggleEditDialog();
  };

  const handleFolderOpen = () => {
    if (isEmpty) {
      dispatch(displayToast({ message: "This folder is empty" }));
      return;
    }
    navigate(getBookmarksPanelUrl({ folderContext: origName }));
  };

  useEffect(() => {
    const menuOptions = [
      {
        onClick: toggleEditDialog,
        text: "Edit",
        icon: AiFillEdit,
      },
      {
        onClick: handleDeleteOptionClick,
        text: "Delete",
        icon: FaFolderMinus,
      },
    ];
    setMenuOptions(menuOptions);
  }, [handleDeleteOptionClick, toggleEditDialog]);

  return (
    <>
      <ContextMenu
        getMenuOptions={() => menuOptions}
        containerStyles={{ display: "flex", alignItems: "center" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            ...containerStyles,
          }}
          onClick={resetSelectedBookmarks}
          onDoubleClick={handleFolderOpen}
        >
          <SvgIcon sx={{ fontSize: "21.5px" }}>
            <FcFolder />
          </SvgIcon>
          <Typography
            noWrap
            sx={{
              flexGrow: 1,
              marginLeft: "8px",
              fontSize: "14px",
              color: isEmpty ? "lightslategray" : "inherit",
            }}
          >
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
});

export default withBookmarkRow(Folder);
