import { ROUTES } from '../../../constants/routes';
import { serialzeObjectToQueryString } from '../../../utils/url';

interface UrlOptions {
  openBookmarksList: string;
}

export const getPersonsPanelUrl = ({ openBookmarksList }: UrlOptions) => {
  const qsObj = {} as UrlOptions;
  if (openBookmarksList) {
    qsObj.openBookmarksList = openBookmarksList;
  }
  return `${ROUTES.PERSONS_PANEL}?${serialzeObjectToQueryString(qsObj)}`;
};
