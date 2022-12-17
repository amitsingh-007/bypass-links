import { combineReducers } from 'redux';
import bookmarkOperation from 'SrcPath/BookmarksPanel/reducers';
import personsReducer from 'SrcPath/PersonsPanel/reducers';
import reducer from '.';

const rootReducer = combineReducers({
  root: reducer,
  persons: personsReducer,
  bookmarkOperation,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
