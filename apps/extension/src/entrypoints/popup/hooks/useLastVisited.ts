import useSWR from 'swr';

import { getlastVisitedText } from '@popup/utils/lastVisited';

const useLastVisited = (url = '') =>
  useSWR(url ? ['last-visited', url] : null, () => getlastVisitedText(url));

export default useLastVisited;
