import { getCurrentTab } from '@/utils/tabs';
import { useEffect, useState } from 'react';

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
