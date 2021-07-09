import { combineReducers } from "redux";
import reducer from ".";
import toastReducer from "./toast";

const rootReducer = combineReducers({
  root: reducer,
  toast: toastReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
