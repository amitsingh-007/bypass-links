import { ROUTES } from '../../../constants/routes';
import { serializeObjectToQueryString } from '../../../utils/url';
import { EBookmarkOperation, ROOT_FOLDER_ID } from '../constants';
import { type BMPanelQueryParams } from '../interfaces/url';

export const getBookmarksPanelUrl = ({
  folderId = ROOT_FOLDER_ID,
  operation = EBookmarkOperation.NONE,
  bmUrl = '',
}: Partial<BMPanelQueryParams>) => {
  const qsObj: BMPanelQueryParams = {
    folderId,
    operation,
    bmUrl,
  };
  return `${ROUTES.BOOKMARK_PANEL}?${serializeObjectToQueryString(qsObj)}`;
};
