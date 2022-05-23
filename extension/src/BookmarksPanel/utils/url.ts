import { defaultBookmarkFolder } from 'GlobalConstants';
import { ROUTES } from 'GlobalConstants/routes';
import { serialzeObjectToQueryString } from 'GlobalUtils/url';
import { BOOKMARK_OPERATION } from '../constants';
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
  return `${ROUTES.BOOKMARK_PANEL}?${serialzeObjectToQueryString(qsObj)}`;
};
