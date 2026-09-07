import { createContext } from 'react';

interface IDynamicContext {
  location: {
    push: (url: string) => void;
  };
  storage: {
    get: <T>(key: string) => Promise<T | null | undefined>;
    set: (key: string, data: any) => Promise<void>;
  };
  tabs: {
    open: (url: string) => void;
  };
  favicon: {
    getUrl: (url: string) => string;
  };
}

// Both apps always mount a provider, so no meaningful default exists
const DynamicContext = createContext<IDynamicContext>({} as IDynamicContext);

export default DynamicContext;
