import {
  RESET_AUTHENTICATION_PROGRESS,
  SET_AUTHENTICATION_PROGRESS,
} from 'GlobalActionTypes/auth';
import { AuthAction, AuthState } from './interfaces/auth';

const defaultState = {
  authProgress: null,
};

const authReducer = (
  state: AuthState = defaultState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case SET_AUTHENTICATION_PROGRESS:
      return {
        ...state,
        authProgress: action.data,
      };
    case RESET_AUTHENTICATION_PROGRESS:
      return {
        ...state,
        authProgress: null,
      };
    default:
      return state;
  }
};

export default authReducer;
