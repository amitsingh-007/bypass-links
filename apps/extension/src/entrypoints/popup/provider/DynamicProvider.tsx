import { DynamicContext, EStorageKey } from '@bypass/shared';
import { type ContextType, type PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

import { getFaviconUrl } from '@/constants/favicon';
import { bookmarksItem, personsItem } from '@/storage/items';
import { startHistoryWatch } from '@/utils/history';

const nameItems = new Map<string, { getValue: () => Promise<unknown> }>([
  [EStorageKey.bookmarks, bookmarksItem],
  [EStorageKey.persons, personsItem],
]);

function DynamicProvider({ children }: PropsWithChildren) {
  const [, navigate] = useLocation();

  const ctx: NonNullable<ContextType<typeof DynamicContext>> = {
    location: {
      push: (url: string) => navigate(url),
    },
    storage: {
      get: async (key, schema) => {
        const item = nameItems.get(key);
        const value: unknown = item
          ? await item.getValue()
          : (await browser.storage.local.get(key))[key];
        return value == null ? value : schema.parse(value);
      },
      set: async (key: string, value: any) =>
        browser.storage.local.set({ [key]: value }),
    },
    tabs: {
      // Idempotent, so loop callers can call this per url
      open: (url: string) => {
        void startHistoryWatch();
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
