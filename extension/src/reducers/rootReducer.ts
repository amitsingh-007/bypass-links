import { combineReducers } from 'redux';
import reducer from '.';

const rootReducer = combineReducers({
  root: reducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
