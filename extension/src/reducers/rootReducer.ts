import { combineReducers } from 'redux';
import bookmarkOperation from 'SrcPath/BookmarksPanel/reducers';
import historyMonitorReducer from 'SrcPath/HistoryPanel/reducers';
import personsReducer from 'SrcPath/PersonsPanel/reducers';
import reducer from '.';

const rootReducer = combineReducers({
  root: reducer,
  history: historyMonitorReducer,
  persons: personsReducer,
  bookmarkOperation,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
