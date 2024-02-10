import { STORAGE_KEYS } from '@bypass/shared';
import { type User } from 'firebase/auth';
import { useRouter } from 'next/router';
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
}

const AuthContext = createContext<IAuthContext>({
  user: null,
});

const RESTRICTED_PATHS = ['/'];

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [user, setUser] = useState<IAuthContext['user']>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const ctx = useMemo(() => ({ user }), [user]);

  useEffect(() => {
    if (isInitialized || RESTRICTED_PATHS.includes(router.pathname)) {
      return;
    }
    const initAuth = async () => {
      const { onAuthStateChange } = await import('../firebase/auth');
      onAuthStateChange((_user: User | null) => setUser(_user));
      setIsInitialized(true);
    };
    initAuth();
  }, [isInitialized, router.pathname]);

  useEffect(() => {
    if (!user || router.pathname === ROUTES.BYPASS_LINKS_WEB) {
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
  }, [router, user]);

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
};

export const useUser = () => {
  const { user } = useContext(AuthContext);

  return {
    user,
    isLoggedIn: Boolean(user?.uid),
  };
};
