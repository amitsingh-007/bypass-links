import { useUser } from '@/ui/provider/AuthProvider';
import {
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/ui/provider/utils';
import { status2FA } from '@bypass/common/components/Auth/apis/twoFactorAuth';
import { STORAGE_KEYS } from '@bypass/common/constants/storage';
import { User } from 'firebase/auth';
import { useCallback, useState } from 'react';
import { ITwoFactorAuth } from '../interface';

const sync2FAToStorage = async (user: User) => {
  if (isExistsInLocalStorage(STORAGE_KEYS.twoFactorAuth)) {
    return;
  }
  const { is2FAEnabled } = await status2FA(user.uid);
  const data: ITwoFactorAuth = {
    is2FAEnabled,
    isTOTPVerified: false,
  };
  await setToLocalStorage(STORAGE_KEYS.twoFactorAuth, data);
};

const usePreload2FA = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const preloadData = useCallback(async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    await sync2FAToStorage(user);
    setIsLoading(false);
  }, [user]);

  const clearData = async () => {
    setIsLoading(true);
    removeFromLocalStorage(STORAGE_KEYS.twoFactorAuth);
    setIsLoading(false);
  };

  return { isLoading, preloadData, clearData };
};

export default usePreload2FA;
