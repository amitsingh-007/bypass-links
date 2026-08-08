import usePreloadBookmarks from '@app/bookmark-panel/hooks/usePreloadBookmarks';
import usePreloadPerson from '@app/persons-panel/hooks/usePreloadPerson';
import { useUser } from '@app/provider/AuthProvider';

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

  const preloadData = async () => {
    await Promise.all([preloadBookmarksData(), preloadPersonData()]);
  };

  const clearData = async () => {
    await Promise.all([clearBookmarksData(), clearPersonData()]);
  };

  const isDataLoading = isLoadingBookmarks || isLoadingPersons;
  const isLoading = !isLoginIntialized || isDataLoading;

  return {
    isLoading,
    preloadData,
    clearData,
  };
};

export default useWebPreload;
