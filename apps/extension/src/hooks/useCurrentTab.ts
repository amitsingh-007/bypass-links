import { useEffect, useState } from 'react';
import { getCurrentTab } from '@/utils/tabs';

const useCurrentTab = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab>();

  useEffect(() => {
    getCurrentTab().then((curTab) => {
      setTab(curTab);
    });
  }, []);

  return tab;
};

export default useCurrentTab;
