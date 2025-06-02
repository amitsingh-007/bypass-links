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
});

export default DynamicContext;
