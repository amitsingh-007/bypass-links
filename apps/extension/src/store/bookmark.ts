import { BOOKMARK_OPERATION, IBookmarkOperation } from '@bypass/shared';
import { create } from 'zustand';

interface OperationState {
  operation: IBookmarkOperation;
  url: string;
}

interface State {
  bookmarkOperation: OperationState;
  setBookmarkOperation: (operation: IBookmarkOperation, url: string) => void;
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
