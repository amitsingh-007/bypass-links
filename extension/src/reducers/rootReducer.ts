import { combineReducers } from 'redux';
import bookmarkOperation from 'SrcPath/BookmarksPanel/reducers';
import historyMonitorReducer from 'SrcPath/HistoryPanel/reducers';
import personsReducer from 'SrcPath/PersonsPanel/reducers';
import reducer from '.';
import extensionReducer from './extension';
import toastReducer from './toast';

const rootReducer = combineReducers({
  root: reducer,
  toast: toastReducer,
  extension: extensionReducer,
  history: historyMonitorReducer,
  persons: personsReducer,
  bookmarkOperation,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
