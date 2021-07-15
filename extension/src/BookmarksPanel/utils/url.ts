import { defaultBookmarkFolder } from "GlobalConstants";
import { ROUTES } from "GlobalConstants/routes";
import { serialzeObjectToQueryString } from "GlobalUtils/url";
import { BMPanelQueryParams } from "../interfaces/url";

export const getBookmarksPanelUrl = ({
  folder = defaultBookmarkFolder,
  addBookmark = false,
  editBookmark = false,
  url = "",
  title = "",
}) => {
  const qsObj = {
    folderContext: folder,
    addBookmark: addBookmark,
    editBookmark: editBookmark,
    bmUrl: url,
    bmTitle: title,
  } as BMPanelQueryParams;
  return `${ROUTES.BOOKMARK_PANEL}?${serialzeObjectToQueryString(qsObj)}`;
};
