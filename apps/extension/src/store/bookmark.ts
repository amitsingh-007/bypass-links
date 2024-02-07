import { EBookmarkOperation } from '@bypass/shared';
import { create } from 'zustand';

interface OperationState {
  operation: EBookmarkOperation;
  url: string;
}

interface State {
  bookmarkOperation: OperationState;
  setBookmarkOperation: (operation: EBookmarkOperation, url: string) => void;
  resetBookmarkOperation: VoidFunction;
}

const defaultState = {
  operation: EBookmarkOperation.NONE,
  url: '',
};

const useBookmarkStore = create<State>()((set) => ({
  bookmarkOperation: defaultState,
  setBookmarkOperation: (operation = EBookmarkOperation.NONE, url = '') =>
    set(() => ({ bookmarkOperation: { operation, url } })),
  resetBookmarkOperation: () =>
    set(() => ({ bookmarkOperation: defaultState })),
}));

export default useBookmarkStore;
