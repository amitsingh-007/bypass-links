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
  bmUrl: string;
  bmTitle: string;
  editBookmark: boolean;
  folderContext: BookmarkProps["curFolder"];
  contextBookmarks: ContextBookmarks;
  handleFolderRemove: FolderProps["handleRemove"];
  handleFolderEdit: FolderProps["handleEdit"];
  resetSelectedBookmarks: FolderProps["resetSelectedBookmarks"];
  handleBookmarkSave: BookmarkProps["handleSave"];
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
    bmUrl,
    bmTitle,
    editBookmark,
    folderContext,
    contextBookmarks,
    handleFolderRemove,
    handleFolderEdit,
    resetSelectedBookmarks,
    handleBookmarkSave,
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
    <Box key={isDir ? name : url} style={style}>
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
          handleSave={handleBookmarkSave}
          handleRemove={handleUrlRemove}
          handleSelectedChange={handleSelectedChange}
          handleOpenSelectedBookmarks={handleOpenSelectedBookmarks}
          handleBulkBookmarksMove={handleBulkBookmarksMove}
          handleBulkUrlRemove={handleBulkUrlRemove}
          editBookmark={editBookmark && url === bmUrl && title === bmTitle}
        />
      )}
    </Box>
  );
}, areEqual);
VirtualRow.displayName = "VirtualRow";

export default VirtualRow;
