import { ReactElement, useEffect } from 'react';
import { User } from 'firebase/auth';
import useUser from '../hooks/useUser';
import { onAuthStateChange } from '../firebase/auth';

const AuthProvider = ({ children }: { children: ReactElement }) => {
  const { setUser } = useUser();

  useEffect(() => {
    onAuthStateChange((user: User | null) => setUser(user));
  }, [setUser]);

  return children;
};

export default AuthProvider;
