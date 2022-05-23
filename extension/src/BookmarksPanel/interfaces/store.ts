import { setBookmarkOperation } from '../actionCreators';
import { BOOKMARK_OPERATION } from '../constants';

export interface OperationState {
  operation: BOOKMARK_OPERATION;
  url: string;
}

export interface OperationAction {
  type: string;
  data?: ReturnType<typeof setBookmarkOperation>['data'];
}
