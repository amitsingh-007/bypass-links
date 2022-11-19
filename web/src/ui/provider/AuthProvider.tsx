import { ReactElement, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/auth';

import { createContext } from 'react';

interface IAuthContext {
  user: User | null;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
});

export const AuthProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<IAuthContext['user']>(null);

  useEffect(() => {
    onAuthStateChange((user: User | null) => setUser(user));
  }, []);

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
