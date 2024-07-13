import usePreloadBookmarks from '../../app/bookmark-panel/hooks/usePreloadBookmarks';
import usePreloadPerson from '../../app/persons-panel/hooks/usePreloadPerson';
import { useUser } from '../provider/AuthProvider';
import usePreload2FA from '../TwoFactorAuth/hooks/usePreload2FA';

const useWebPreload = () => {
  const { isLoginIntialized } = useUser();
  const {
    isLoading: isLoadingBookmarks,
    preloadData: preloadBookmarksData,
    clearData: clearBookmarksData,
  } = usePreloadBookmarks();
  const {
    isLoading: isLoadingPersons,
    preloadData: preloadPersonData,
    clearData: clearPersonData,
  } = usePreloadPerson();
  const {
    isLoading: isLoading2FA,
    preloadData: preload2FAData,
    clearData: clear2FAData,
  } = usePreload2FA();

  const preloadData = async () => {
    await Promise.all([
      preloadBookmarksData(),
      preloadPersonData(),
      preload2FAData(),
    ]);
  };

  const clearData = async () => {
    await Promise.all([
      clearBookmarksData(),
      clearPersonData(),
      clear2FAData(),
    ]);
  };

  const isDataLoading = isLoadingBookmarks || isLoadingPersons || isLoading2FA;
  const isLoading = !isLoginIntialized || isDataLoading;

  return {
    isLoading,
    preloadData,
    clearData,
  };
};

export default useWebPreload;
