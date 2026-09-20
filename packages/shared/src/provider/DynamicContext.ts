import { createContext, use } from 'react';
import { type z } from 'zod/mini';

interface IDynamicContext {
  location: {
    push: (url: string) => void;
  };
  storage: {
    get: <T>(
      key: string,
      schema: z.ZodMiniType<T>
    ) => Promise<T | null | undefined>;
    set: (key: string, data: any) => Promise<void>;
  };
  tabs: {
    open: (url: string) => void;
  };
  favicon: {
    getUrl: (url: string) => string;
  };
}

const DynamicContext = createContext<IDynamicContext | null>(null);

export const useDynamicContext = () => {
  const context = use(DynamicContext);
  if (!context) {
    throw new Error('useDynamicContext requires a DynamicProvider');
  }
  return context;
};

export default DynamicContext;
