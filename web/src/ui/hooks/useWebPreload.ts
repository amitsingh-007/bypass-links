import usePreloadBookmarks from '../BookmarksPage/hooks/usePreloadBookmarks';
import usePreloadPerson from '../PersonsPage/hooks/usePreloadPerson';
import usePreload2FA from '../TwoFactorAuth/hooks/usePreload2FA';

const useWebPreload = () => {
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

  return {
    isLoading: isLoadingPersons || isLoadingBookmarks || isLoading2FA,
    preloadData,
    clearData,
  };
};

export default useWebPreload;
