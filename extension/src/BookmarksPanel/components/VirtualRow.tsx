import { Box } from "@material-ui/core";
import { memo } from "react";
import { areEqual } from "react-window";
import {
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
} from "../interfaces";
import { getAllFolderNames, isFolderEmpty } from "../utils";
import Bookmark, { Props as BookmarkProps } from "./Bookmark";
import Folder, { Props as FolderProps } from "./Folder";

export interface VirtualRowProps {
  folderList: IBookmarksObj["folderList"];
  folders: IBookmarksObj["folders"];
  selectedBookmarks: ISelectedBookmarks;
  folderContext: BookmarkProps["curFolder"];
  contextBookmarks: ContextBookmarks;
  handleFolderRemove: FolderProps["handleRemove"];
  handleFolderEdit: FolderProps["handleEdit"];
  resetSelectedBookmarks: FolderProps["resetSelectedBookmarks"];
  handleUrlRemove: BookmarkProps["handleRemove"];
  handleSelectedChange: BookmarkProps["handleSelectedChange"];
  handleOpenSelectedBookmarks: BookmarkProps["handleOpenSelectedBookmarks"];
  handleBulkBookmarksMove: BookmarkProps["handleBulkBookmarksMove"];
  handleBulkUrlRemove: BookmarkProps["handleBulkUrlRemove"];
}

const VirtualRow = memo<{
  index: number;
  style: React.CSSProperties;
  data: VirtualRowProps;
}>(({ index, style, data: innerProps }) => {
  const {
    folderList,
    folders,
    selectedBookmarks,
    folderContext,
    contextBookmarks,
    handleFolderRemove,
    handleFolderEdit,
    resetSelectedBookmarks,
    handleUrlRemove,
    handleSelectedChange,
    handleOpenSelectedBookmarks,
    handleBulkBookmarksMove,
    handleBulkUrlRemove,
  } = innerProps;
  const folderNamesList = getAllFolderNames(folderList);
  const selectedCount = selectedBookmarks.filter(Boolean).length;
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
          curFolder={folderContext}
          taggedPersons={taggedPersons}
          isSelected={Boolean(selectedBookmarks[index])}
          selectedCount={selectedCount}
          folder={folderContext}
          folderNamesList={folderNamesList}
          handleRemove={handleUrlRemove}
          handleSelectedChange={handleSelectedChange}
          handleOpenSelectedBookmarks={handleOpenSelectedBookmarks}
          handleBulkBookmarksMove={handleBulkBookmarksMove}
          handleBulkUrlRemove={handleBulkUrlRemove}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = "VirtualRow";

export default VirtualRow;
