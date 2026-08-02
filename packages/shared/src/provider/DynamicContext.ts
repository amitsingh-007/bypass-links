import { createContext } from 'react';

import { asyncNoOp, noOp } from '../utils';

interface IDynamicContext {
  location: {
    push: (url: string) => void;
    query: () => string;
    goBack: VoidFunction;
  };
  storage: {
    get: <T>(key: string) => Promise<T | null | undefined>;
    set: (key: string, data: any) => Promise<void>;
  };
  /**
   * Opening a link differs per platform (browser.tabs.create vs window.open),
   * and the extension must arm its history watcher first. Routing it through
   * the seam keeps that invariant in one place instead of at every call site.
   */
  tabs: {
    open: (url: string) => void;
  };
  favicon: {
    getUrl: (url: string) => string;
  };
}

const DynamicContext = createContext<IDynamicContext>({
  location: {
    push: noOp,
    query: () => '',
    goBack: noOp,
  },
  storage: {
    get: async () => undefined,
    set: asyncNoOp,
  },
  tabs: {
    open: noOp,
  },
  favicon: {
    getUrl: (url: string) => url,
  },
});

export default DynamicContext;
