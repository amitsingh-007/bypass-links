import useSWR from 'swr';

import { getlastVisitedText } from '@popup/utils/lastVisited';

const useLastVisited = (url = '') =>
  useSWR(['last-visited', url], () => getlastVisitedText(url));

export default useLastVisited;
