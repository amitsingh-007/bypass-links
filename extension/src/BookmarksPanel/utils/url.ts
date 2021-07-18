import { defaultBookmarkFolder } from "GlobalConstants";
import { ROUTES } from "GlobalConstants/routes";
import { serialzeObjectToQueryString } from "GlobalUtils/url";
import { BookmarkUrlParams } from "SrcPath/PersonsPanel/interfaces/url";
import { BMPanelQueryParams } from "../interfaces/url";

export const getBookmarksPanelUrl = ({
  folder = defaultBookmarkFolder,
  addBookmark = false,
  editBookmark = false,
  url = "",
  title = "",
}: BookmarkUrlParams) => {
  const qsObj: BMPanelQueryParams = {
    folderContext: folder,
    addBookmark: addBookmark,
    editBookmark: editBookmark,
    bmUrl: url,
    bmTitle: title,
  };
  return `${ROUTES.BOOKMARK_PANEL}?${serialzeObjectToQueryString(qsObj)}`;
};
