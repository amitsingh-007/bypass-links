import { DynamicContext } from '@bypass/shared';
import { type ContextType, type PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

import { getFaviconUrl } from '@/constants/favicon';
import useHistoryStore from '@store/history';

function DynamicProvider({ children }: PropsWithChildren) {
  const [, navigate] = useLocation();
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );

  const ctx: NonNullable<ContextType<typeof DynamicContext>> = {
    location: {
      push: (url: string) => navigate(url),
    },
    storage: {
      get: async (key, schema) => {
        const value: unknown = (await browser.storage.local.get(key))[key];
        return value == null ? value : schema.parse(value);
      },
      set: async (key: string, value: any) =>
        browser.storage.local.set({ [key]: value }),
    },
    tabs: {
      // Idempotent, so loop callers can call this per url
      open: (url: string) => {
        startHistoryMonitor();
        browser.tabs.create({ url, active: false }).catch((error) => {
          console.error(error);
          toast.error('Could not open the link in a new tab');
        });
      },
    },
    favicon: { getUrl: getFaviconUrl },
  };

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
