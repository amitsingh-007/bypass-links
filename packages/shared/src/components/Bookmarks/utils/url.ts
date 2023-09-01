import { ROUTES } from '../../../constants/routes';
import { serializeObjectToQueryString } from '../../../utils/url';
import { BOOKMARK_OPERATION, defaultBookmarkFolder } from '../constants';
import { ContextBookmark } from '../interfaces';
import { BMPanelQueryParams } from '../interfaces/url';

export const getBookmarksPanelUrl = ({
  folderContext = defaultBookmarkFolder,
  operation = BOOKMARK_OPERATION.NONE,
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
