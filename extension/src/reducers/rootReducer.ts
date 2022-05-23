import { combineReducers } from 'redux';
import bookmarkOperation from 'SrcPath/BookmarksPanel/reducers';
import historyMonitorReducer from 'SrcPath/HistoryPanel/reducers';
import personsReducer from 'SrcPath/PersonsPanel/reducers';
import reducer from '.';
import authReducer from './auth';
import extensionReducer from './extension';
import toastReducer from './toast';

const rootReducer = combineReducers({
  root: reducer,
  toast: toastReducer,
  extension: extensionReducer,
  history: historyMonitorReducer,
  auth: authReducer,
  persons: personsReducer,
  bookmarkOperation,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
