import create from 'zustand';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { BOOKMARK_OPERATION } from '@bypass/shared/components/Bookmarks/constants';

interface OperationState {
  operation: BOOKMARK_OPERATION;
  url: string;
}

interface State {
  bookmarkOperation: OperationState;
  setBookmarkOperation: (operation: BOOKMARK_OPERATION, url: string) => void;
  resetBookmarkOperation: VoidFunction;
}

const defaultState = {
  operation: BOOKMARK_OPERATION.NONE,
  url: '',
};

const useBookmarkStore = create<State>()((set) => ({
  bookmarkOperation: defaultState,
  setBookmarkOperation: (operation = BOOKMARK_OPERATION.NONE, url = '') =>
    set(() => ({ bookmarkOperation: { operation, url } })),
  resetBookmarkOperation: () =>
    set(() => ({ bookmarkOperation: defaultState })),
}));

export default useBookmarkStore;
