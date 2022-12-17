import { combineReducers } from 'redux';
import bookmarkOperation from 'SrcPath/BookmarksPanel/reducers';
import reducer from '.';

const rootReducer = combineReducers({
  root: reducer,
  bookmarkOperation,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
