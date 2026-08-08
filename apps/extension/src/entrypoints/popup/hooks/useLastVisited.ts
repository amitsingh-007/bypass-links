import { swrKeys } from '@bypass/shared';
import useSWR from 'swr';

import {
  getLastVisitedTextMap,
  getlastVisitedText,
} from '@popup/utils/lastVisited';

const useLastVisited = (url = '') =>
  useSWR(swrKeys.lastVisited(url), () => getlastVisitedText(url));

export const useLastVisitedMap = (urls: string[]) => {
  const { data } = useSWR(swrKeys.lastVisitedMap(urls), () =>
    getLastVisitedTextMap(urls)
  );
  return data ?? {};
};

export default useLastVisited;
