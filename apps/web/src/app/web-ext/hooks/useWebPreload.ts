import { useRef } from 'react';

import usePreloadBookmarks from '@app/bookmark-panel/hooks/usePreloadBookmarks';
import usePreloadPerson from '@app/persons-panel/hooks/usePreloadPerson';
import { useUser } from '@app/provider/AuthProvider';

const useWebPreload = () => {
  const { isLoginIntialized } = useUser();
  const inFlight = useRef<Promise<void> | null>(null);
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

  /**
   * Idempotent while running, rather than memoized. This identity reaches an
   * effect dep array in web-ext/page.tsx, but nothing in the chain below is
   * memoized either, so a useCallback here would be defeated regardless.
   * Guarding on the in-flight promise makes a repeat call cheap however often
   * the effect re-runs.
   */
  const preloadData = async () => {
    inFlight.current ??= Promise.all([
      preloadBookmarksData(),
      preloadPersonData(),
    ])
      .then(() => undefined)
      .finally(() => {
        inFlight.current = null;
      });
    return inFlight.current;
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
