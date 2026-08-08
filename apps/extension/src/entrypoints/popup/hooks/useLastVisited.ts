import { swrKeys } from '@bypass/shared';
import useSWR from 'swr';

import { getlastVisitedText } from '@popup/utils/lastVisited';

const useLastVisited = (url = '') =>
  useSWR(swrKeys.lastVisited(url), () => getlastVisitedText(url));

export default useLastVisited;
