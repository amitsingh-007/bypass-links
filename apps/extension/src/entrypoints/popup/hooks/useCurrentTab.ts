import { swrKeys } from '@bypass/shared';
import useSWR from 'swr';

import { getCurrentTab } from '@popup/utils/tabs';

const useCurrentTab = () => {
  const { data } = useSWR(swrKeys.currentTab, getCurrentTab);
  return data;
};

export default useCurrentTab;
