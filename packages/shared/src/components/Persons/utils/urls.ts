import { ROUTES } from '../../../constants/routes';
import { serializeObjectToQueryString } from '../../../utils/url';

interface UrlOptions {
  openBookmarksList: string;
}

export const getPersonsPanelUrl = (obj: UrlOptions) =>
  `${ROUTES.PERSONS_PANEL}?${serializeObjectToQueryString(obj)}`;
