import { ROUTES } from '../../../constants/routes';
import { toQueryString } from '../../../utils/queryString';

interface UrlOptions {
  openBookmarksList: string;
}

export const getPersonsPanelUrl = (obj: UrlOptions) =>
  `${ROUTES.PERSONS_PANEL}?${toQueryString(obj)}`;
