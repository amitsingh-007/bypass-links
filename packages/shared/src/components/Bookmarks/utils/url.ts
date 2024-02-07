import { ROUTES } from '../../../constants/routes';
import { serializeObjectToQueryString } from '../../../utils/url';
import { DEFAULT_BOOKMARK_FOLDER, EBookmarkOperation } from '../constants';
import {
  ContextBookmark,
  IBookmarksObj,
  IDecodedFolder,
  IEncodedFolder,
} from '../interfaces';
import { BMPanelQueryParams } from '../interfaces/url';

export const getBookmarksPanelUrl = ({
  folderContext = DEFAULT_BOOKMARK_FOLDER,
  operation = EBookmarkOperation.NONE,
  bmUrl = '',
}: Partial<BMPanelQueryParams>) => {
  const qsObj: BMPanelQueryParams = {
    folderContext,
    operation,
    bmUrl,
  };
  return `${ROUTES.BOOKMARK_PANEL}?${serializeObjectToQueryString(qsObj)}`;
};

export const getBookmarkId = (bookmark: ContextBookmark) =>
  bookmark.isDir ? bookmark.name : bookmark.url;

export const getDecodedFolder = (folder: IEncodedFolder): IDecodedFolder => ({
  isDir: true,
  name: atob(folder.name),
  isDefault: Boolean(folder.isDefault),
});

export const getDecodedFolderList = (folderList: IBookmarksObj['folderList']) =>
  Object.entries(folderList).map(([_key, value]) => getDecodedFolder(value));
