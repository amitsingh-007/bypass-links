import { useEffect, useState } from 'react';
import { getCurrentTab } from '@/utils/tabs';

const useCurrentTab = () => {
  const [tab, setTab] = useState<Awaited<ReturnType<typeof getCurrentTab>>>();

  useEffect(() => {
    getCurrentTab().then((curTab) => {
      setTab(curTab ?? undefined);
    });
  }, []);

  return tab;
};

export default useCurrentTab;
