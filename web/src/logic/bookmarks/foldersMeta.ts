import { getFoldersMeta } from "@/database/bookmarks/foldersMeta";
import { DBFolderMeta } from "@/interfaces/bookmarks";
import { IFolderMeta } from "@common/interfaces/bookmark";
import { getUpdates } from "..";

const getFoldersMetaAsList = (foldersObj: IFolderMeta) => {
  const list: DBFolderMeta[] = [];
  Object.entries(foldersObj).forEach(([folderId, data]) => {
    data.forEach((x) => {
      list.push({
        folder_id: folderId,
        content_id: x.contentId,
        is_folder: x.isFolder,
        priority: x.priority,
      });
    });
  });
  return list;
};

export const saveFoldersMeta = async (
  userId: string,
  foldersMetaObj: IFolderMeta | null
): Promise<boolean> => {
  const allFoldersMetaObj = await getFoldersMeta(userId);
  if (!foldersMetaObj || !allFoldersMetaObj) {
    return false;
  }
  const folders = getFoldersMetaAsList(foldersMetaObj);
  const allFolders = getFoldersMetaAsList(allFoldersMetaObj);
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
