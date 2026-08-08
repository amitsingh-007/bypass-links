import { swrKeys } from '@bypass/shared';
import useSWR from 'swr';

import {
  getLastVisitedTextMap,
  getlastVisitedText,
} from '@popup/utils/lastVisited';

const useLastVisited = (url = '') =>
  useSWR(swrKeys.lastVisited(url), () => getlastVisitedText(url));

/** One entry for a whole list, so rows don't each re-read storage and re-hash. */
export const useLastVisitedMap = (urls: string[]) => {
  const { data } = useSWR(swrKeys.lastVisitedMap(urls), () =>
    getLastVisitedTextMap(urls)
  );
  return data ?? {};
};

export default useLastVisited;
