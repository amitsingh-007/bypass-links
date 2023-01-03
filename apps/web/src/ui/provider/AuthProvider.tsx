import { useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/auth';

import { createContext } from 'react';
import { useRouter } from 'next/router';
import { getFromLocalStorage } from './utils';
import { STORAGE_KEYS } from '@bypass/shared';
import { ITwoFactorAuth } from '../TwoFactorAuth/interface';
import { ROUTES } from '../constants/routes';

interface IAuthContext {
  user: User | null;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<IAuthContext['user']>(null);

  useEffect(() => {
    onAuthStateChange((user: User | null) => setUser(user));
  }, []);

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

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useUser = () => {
  const { user } = useContext(AuthContext);

  return {
    user,
    isLoggedIn: Boolean(user?.uid),
  };
};
