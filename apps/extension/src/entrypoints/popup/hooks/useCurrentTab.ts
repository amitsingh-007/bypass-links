import useSWR from 'swr';

import { extSwrKeys } from '@/swr/keys';
import { getCurrentTab } from '@popup/utils/tabs';

const useCurrentTab = () => {
  const { data } = useSWR(extSwrKeys.currentTab, getCurrentTab);
  return data;
};

export default useCurrentTab;
