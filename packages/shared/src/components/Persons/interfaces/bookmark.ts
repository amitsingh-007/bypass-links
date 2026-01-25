import { type IEncodedBookmark } from '../../Bookmarks/interfaces';

export interface IBookmarkWithFolder extends IEncodedBookmark {
  parentName: string;
  parentId: string;
}
