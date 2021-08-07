import { DBFolder } from "@/interfaces/bookmarks";
import { IFolder } from "@common/interfaces/bookmark";
import {
  deleteFolders,
  getFolders,
  upsertFolders,
} from "@database/bookmarks/folders";
import { getUpdates } from "..";

const getFoldersAsList = (foldersObj: IFolder) =>
  Object.entries(foldersObj).map<DBFolder>(([folderId, data]) => ({
    id: folderId,
    name: data.name,
    parent_id: data.parentId,
  }));

export const saveFolders = async (
  userId: string,
  foldersObj: IFolder | null
): Promise<boolean> => {
  const allFoldersObj = await getFolders(userId);
  if (!foldersObj || !allFoldersObj) {
    return false;
  }
  const folders = getFoldersAsList(foldersObj);
  const allFolders = getFoldersAsList(allFoldersObj);
  const { updateList, deleteList } = getUpdates(allFolders, folders, "id");
  let isSuccess = true;
  if (updateList?.length > 0) {
    isSuccess = await upsertFolders(userId, updateList);
  }
  if (deleteList?.length > 0) {
    isSuccess = await deleteFolders(userId, deleteList);
  }
  return isSuccess;
};
