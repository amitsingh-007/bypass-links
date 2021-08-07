import { getFoldersMeta } from "@/database/bookmarks/foldersMeta";
import { IBookmarks } from "@common/interfaces/bookmark";
import { getUrls } from "@database/bookmarks";
import { getFolders } from "@database/bookmarks/folders";
import { saveFolders } from "./folders";

export const getBookmarks = async (userId: string): Promise<IBookmarks> => {
  const [urls, folders, foldersMeta] = await Promise.all([
    getUrls(userId),
    getFolders(userId),
    getFoldersMeta(userId),
  ]);
  return { urls, folders, foldersMeta };
};

export const saveBookmarks = async (
  userId: string,
  bookmarksObj: IBookmarks
): Promise<boolean> => {
  try {
    const { folders } = bookmarksObj;
    Promise.all([saveFolders(userId, folders)]);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
