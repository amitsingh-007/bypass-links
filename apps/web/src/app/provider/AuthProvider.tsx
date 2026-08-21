import { type User } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import {
  type PropsWithChildren,
  createContext,
  use,
  useEffect,
  useState,
} from 'react';

import { WEB_ROUTES } from '../constants/routes';
import { onAuthStateChange } from '../helpers/firebase/auth';

interface IAuthContext {
  user: User | null;
  isLoginIntialized: boolean;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoginIntialized: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [user, setUser] = useState<IAuthContext['user']>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const ctx = { user, isLoginIntialized: isInitialized };

  const isRestrictedPath = pathname === WEB_ROUTES.HOMEPAGE;

  useEffect(() => {
    if (isRestrictedPath) {
      return undefined;
    }

    const unsubscribe = onAuthStateChange((_user) => {
      setUser(_user);
      setIsInitialized(true);
    });

    return unsubscribe;
  }, [isRestrictedPath]);

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export const useUser = () => {
  const { user, isLoginIntialized } = use(AuthContext);

  return {
    user,
    isLoggedIn: Boolean(user?.uid),
    isLoginIntialized,
  };
};
