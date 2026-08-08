import useSWR from 'swr';

import { extSwrKeys } from '@/swr/keys';
import {
  getLastVisitedTextMap,
  getlastVisitedText,
} from '@popup/utils/lastVisited';

const useLastVisited = (url = '') =>
  useSWR(extSwrKeys.lastVisited(url), () => getlastVisitedText(url));

export const useLastVisitedMap = (urls: string[]) => {
  const { data } = useSWR(extSwrKeys.lastVisitedMap(urls), () =>
    getLastVisitedTextMap(urls)
  );
  return data ?? {};
};

export default useLastVisited;
