import {
  RESET_BOOKMARK_OPERATION,
  SET_BOOKMARK_OPERATION,
} from "../actionTypes";
import { BOOKMARK_OPERATION } from "../constants";

export const setBookmarkOperation = (
  operation: BOOKMARK_OPERATION,
  url: string
) => ({
  type: SET_BOOKMARK_OPERATION,
  data: { operation, url },
});

export const resetBookmarkOperation = () => ({
  type: RESET_BOOKMARK_OPERATION,
});
