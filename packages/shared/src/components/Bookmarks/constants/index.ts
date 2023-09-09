import { ObjectValues } from '../../../interfaces/utilityTypes';

export const DEFAULT_BOOKMARK_FOLDER = 'Bookmarks bar';

export const BOOKMARK_ROW_HEIGHT = 31;

export const BOOKMARK_OPERATION = {
  NONE: 'none',
  ADD: 'add',
  EDIT: 'edit',
} as const;

export type IBookmarkOperation = ObjectValues<typeof BOOKMARK_OPERATION>;
