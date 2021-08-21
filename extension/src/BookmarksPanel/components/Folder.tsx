import { Box, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import FolderTwoToneIcon from "@material-ui/icons/FolderTwoTone";
import { displayToast } from "GlobalActionCreators/toast";
import ContextMenu from "GlobalComponents/ContextMenu";
import { COLOR } from "GlobalConstants/color";
import { MenuOption } from "GlobalInterfaces/menu";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
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

const Folder = memo<Props>(
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
      history.push(getBookmarksPanelUrl({ folderContext: origName }));
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
            <FolderTwoToneIcon
              fontSize="small"
              htmlColor={COLOR.yellow.color}
            />
            <Typography
              noWrap
              sx={{
                flexGrow: 1,
                marginLeft: "8px",
                fontSize: "14px",
                color: isEmpty ? COLOR.blueGrey.color : "inherit",
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
  }
);

export default withBookmarkRow(Folder);
