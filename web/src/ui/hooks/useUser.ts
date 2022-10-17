import { User } from 'firebase/auth';
import { atom, useAtom } from 'jotai';

const userAtom = atom<User | null>(null);

export default function useUser() {
  const [user, setUser] = useAtom(userAtom);

  return {
    user,
    setUser,
  };
}
