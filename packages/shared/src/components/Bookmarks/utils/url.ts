import { ROUTES } from '../../../constants/routes';
import { serializeObjectToQueryString } from '../../../utils/url';
import { DEFAULT_BOOKMARK_FOLDER, EBookmarkOperation } from '../constants';
import { ContextBookmark } from '../interfaces';
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
