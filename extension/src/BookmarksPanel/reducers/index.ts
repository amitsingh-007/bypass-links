import {
  RESET_BOOKMARK_OPERATION,
  SET_BOOKMARK_OPERATION,
} from '../actionTypes';
import { BOOKMARK_OPERATION } from '../constants';
import { OperationAction, OperationState } from '../interfaces/store';

const defaultState = {
  operation: BOOKMARK_OPERATION.NONE,
  url: '',
};

const bookmarkOperation = (
  state: OperationState = defaultState,
  action: OperationAction
): OperationState => {
  switch (action.type) {
    case SET_BOOKMARK_OPERATION:
      return {
        ...state,
        operation: action.data?.operation ?? BOOKMARK_OPERATION.NONE,
        url: action.data?.url ?? '',
      };
    case RESET_BOOKMARK_OPERATION:
      return defaultState;
    default:
      return state;
  }
};

export default bookmarkOperation;
