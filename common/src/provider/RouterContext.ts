import { createContext } from 'react';

interface IRouterContext {
  push: (url: string) => void;
}

const RouterContext = createContext<IRouterContext>({
  push: () => undefined,
});

export default RouterContext;
