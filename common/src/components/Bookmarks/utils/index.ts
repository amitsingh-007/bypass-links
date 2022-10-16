import { IBookmarksObj } from '../interfaces';
import md5 from 'md5';

export const isFolderEmpty = (
  folders: IBookmarksObj['folders'],
  name: string
) => {
  const folder = folders[md5(name)];
  return !folder || folder.length < 1;
};
