import { ROUTES } from '../../../constants/routes';
import { serialzeObjectToQueryString } from '../../../utils/url';
import { BOOKMARK_OPERATION, defaultBookmarkFolder } from '../constants';
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
