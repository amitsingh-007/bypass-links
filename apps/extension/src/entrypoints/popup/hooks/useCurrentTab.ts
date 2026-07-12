import { useEffect, useState } from 'react';

import { getCurrentTab } from '@popup/utils/tabs';

const useCurrentTab = () => {
  const [tab, setTab] = useState<Browser.tabs.Tab>();

  useEffect(() => {
    let ignore = false;
    getCurrentTab().then((curTab) => {
      if (!ignore) {
        setTab(curTab);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  return tab;
};

export default useCurrentTab;
