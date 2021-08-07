import { IFolderMeta } from "@common/interfaces/bookmark";
import supabase from "@helpers/supabase";
import { definitions } from "src/@types/supabase";

export const getFoldersMeta = async (
  userId: string
): Promise<IFolderMeta | null> => {
  const { data, error } = await supabase
    .from<definitions["bookmark_folder_meta"]>("bookmark_folder_meta")
    .select("folder_id, content_id, is_folder, priority")
    .match({ user_id: userId, is_prod: __PROD__ });
  if (!data || error) {
    console.error(error);
    return null;
  }
  const mappedData = data.reduce<IFolderMeta>((obj, x) => {
    const metaData = {
      contentId: x.content_id,
      isFolder: x.is_folder,
      priority: x.priority,
    };
    const folderId = x.folder_id;
    if (!obj[folderId]) {
      obj[folderId] = [];
    }
    obj[folderId].push(metaData);
    return obj;
  }, {});
  return Object.keys(mappedData).reduce<IFolderMeta>((obj, folderId) => {
    obj[folderId] = mappedData[folderId].sort(
      (a, b) => a.priority - b.priority
    );
    return obj;
  }, {});
};
