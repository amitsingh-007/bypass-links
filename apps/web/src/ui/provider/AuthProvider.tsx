import { STORAGE_KEYS } from '@bypass/shared';
import { type User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ROUTES } from '../constants/routes';
import { ITwoFactorAuth } from '../TwoFactorAuth/interface';
import { getFromLocalStorage } from './utils';

interface IAuthContext {
  user: User | null;
  isLoginIntialized: boolean;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoginIntialized: false,
});

const RESTRICTED_PATHS = ['/'];

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IAuthContext['user']>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const ctx = useMemo(
    () => ({ user, isLoginIntialized: isInitialized }),
    [user, isInitialized]
  );

  useEffect(() => {
    if (isInitialized || RESTRICTED_PATHS.includes(pathname ?? '')) {
      return;
    }
    const initAuth = async () => {
      const { onAuthStateChange, getCurrentUser } = await import(
        '../firebase/auth'
      );

      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsInitialized(true);

      onAuthStateChange((_user) => setUser(_user));
    };
    initAuth();
  }, [isInitialized, pathname]);

  useEffect(() => {
    if (!user || pathname === ROUTES.BYPASS_LINKS_WEB) {
      return;
    }
    getFromLocalStorage<ITwoFactorAuth>(STORAGE_KEYS.twoFactorAuth).then(
      (twoFAData) => {
        if (!twoFAData) {
          return;
        }
        if (twoFAData.is2FAEnabled && !twoFAData.isTOTPVerified) {
          router.replace(ROUTES.BYPASS_LINKS_WEB);
        }
      }
    );
  }, [pathname, router, user]);

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
};

export const useUser = () => {
  const { user, isLoginIntialized } = useContext(AuthContext);

  return {
    user,
    isLoggedIn: Boolean(user?.uid),
    isLoginIntialized,
  };
};
