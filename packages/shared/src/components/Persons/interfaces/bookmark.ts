import { IBookmark } from '../../Bookmarks/interfaces';

export interface ModifiedBookmark extends IBookmark {
  parentName: string;
}
