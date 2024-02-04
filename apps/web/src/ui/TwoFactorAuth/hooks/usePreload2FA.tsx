import { useUser } from '@/ui/provider/AuthProvider';
import {
  isExistsInLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/ui/provider/utils';
import { api } from '@/utils/api';
import { STORAGE_KEYS } from '@bypass/shared';
import { useCallback, useState } from 'react';
import { ITwoFactorAuth } from '../interface';

const sync2FAToStorage = async () => {
  if (isExistsInLocalStorage(STORAGE_KEYS.twoFactorAuth)) {
    return;
  }
  const { is2FAEnabled } = await api.twoFactorAuth.status.query();
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
    await sync2FAToStorage();
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
