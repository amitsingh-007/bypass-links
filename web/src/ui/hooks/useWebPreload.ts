import usePreloadBookmarks from '../BookmarksPage/hooks/usePreloadBookmarks';
import usePreloadPerson from '../PersonsPage/hooks/usePreloadPerson';

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

  const preloadData = async () => {
    await Promise.all([preloadBookmarksData(), preloadPersonData()]);
  };

  const clearData = async () => {
    await Promise.all([clearBookmarksData(), clearPersonData()]);
  };

  return {
    isLoading: isLoadingPersons || isLoadingBookmarks,
    preloadData,
    clearData,
  };
};

export default useWebPreload;
