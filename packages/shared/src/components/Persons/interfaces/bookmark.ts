import { IEncodedBookmark } from '../../Bookmarks/interfaces';

export interface ModifiedBookmark extends IEncodedBookmark {
  parentName: string;
}
