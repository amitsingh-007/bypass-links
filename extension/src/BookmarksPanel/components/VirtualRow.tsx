import { Box } from "@material-ui/core";
import { memo } from "react";
import { areEqual } from "react-window";
import {
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
} from "../interfaces";
import { isFolderEmpty } from "../utils";
import Bookmark, { Props as BookmarkProps } from "./Bookmark";
import Folder, { Props as FolderProps } from "./Folder";

export interface VirtualRowProps {
  folderNamesList: string[];
  folders: IBookmarksObj["folders"];
  selectedBookmarks: ISelectedBookmarks;
  contextBookmarks: ContextBookmarks;
  handleFolderRemove: FolderProps["handleRemove"];
  handleFolderEdit: FolderProps["handleEdit"];
  resetSelectedBookmarks: FolderProps["resetSelectedBookmarks"];
  handleSelectedChange: BookmarkProps["handleSelectedChange"];
}

const VirtualRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: VirtualRowProps;
}>(({ index, style, data: innerProps }) => {
  const {
    folders,
    selectedBookmarks,
    contextBookmarks,
    handleFolderRemove,
    handleFolderEdit,
    resetSelectedBookmarks,
    handleSelectedChange,
  } = innerProps;
  const {
    url = "",
    title = "",
    name = "",
    taggedPersons = [],
    isDir,
  } = contextBookmarks[index];
  return (
    <Box style={style}>
      {isDir ? (
        <Folder
          pos={index}
          isDir={isDir}
          name={name}
          handleRemove={handleFolderRemove}
          handleEdit={handleFolderEdit}
          isEmpty={isFolderEmpty(folders, name)}
          resetSelectedBookmarks={resetSelectedBookmarks}
        />
      ) : (
        <Bookmark
          pos={index}
          isDir={isDir}
          url={url}
          title={title}
          taggedPersons={taggedPersons}
          isSelected={Boolean(selectedBookmarks[index])}
          handleSelectedChange={handleSelectedChange}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = "VirtualRow";

export default VirtualRow;
