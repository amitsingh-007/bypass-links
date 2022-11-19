import { createContext } from 'react';

export interface IDynamicContext {
  push: (url: string) => void;
  storage: {
    get: <T>(key: string) => Promise<T | null | undefined>;
    set: (key: string, data: any) => Promise<void>;
  };
}

const DynamicContext = createContext<IDynamicContext>({
  push: () => undefined,
  storage: {
    get: () => Promise.resolve({} as any),
    set: () => Promise.resolve(),
  },
});

export default DynamicContext;
