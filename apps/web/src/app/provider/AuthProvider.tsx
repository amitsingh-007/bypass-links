import { type User } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ROUTES } from '../constants/routes';
import { onAuthStateChange } from '../helpers/firebase/auth';

interface IAuthContext {
  user: User | null;
  isLoginIntialized: boolean;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoginIntialized: false,
});

const RESTRICTED_PATHS = new Set([ROUTES.HOMEPAGE]);

export function AuthProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [user, setUser] = useState<IAuthContext['user']>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const ctx = useMemo(
    () => ({ user, isLoginIntialized: isInitialized }),
    [user, isInitialized]
  );

  const isRestrictedPath = RESTRICTED_PATHS.has(pathname);

  useEffect(() => {
    if (isRestrictedPath) {
      return;
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
  const { user, isLoginIntialized } = useContext(AuthContext);

  return {
    user,
    isLoggedIn: Boolean(user?.uid),
    isLoginIntialized,
  };
};
