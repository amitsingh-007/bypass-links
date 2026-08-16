import { ROUTES } from '../../../constants/routes';
import {
  deserializeQueryStringToObject,
  serializeObjectToQueryString,
} from '../../../utils/url';
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

const OPERATION_BY_VALUE = new Map<string, EBookmarkOperation>(
  Object.values(EBookmarkOperation).map((operation) => [operation, operation])
);

/**
 * Reader for the url the builder above writes. Falls back rather than throwing:
 * a stale or hand-edited url should not reach the panel as an unknown operation.
 */
export const parseBookmarksPanelUrl = (
  queryString: string
): BMPanelQueryParams => {
  const { folderId, operation, bmUrl } =
    deserializeQueryStringToObject(queryString);

  return {
    folderId: folderId || ROOT_FOLDER_ID,
    operation: OPERATION_BY_VALUE.get(operation) ?? EBookmarkOperation.NONE,
    bmUrl: bmUrl || '',
  };
};
