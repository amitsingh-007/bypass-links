import { IFolder } from "@common/interfaces/bookmark";
import supabase from "@helpers/supabase";
import { definitions } from "src/@types/supabase";
import { DBFolder } from "@/interfaces/bookmarks";

export const getFolders = async (userId: string): Promise<IFolder | null> => {
  const { data, error } = await supabase
    .from<definitions["bookmark_folder"]>("bookmark_folder")
    .select("id, name, parent_id")
    .match({ user_id: userId, is_prod: __PROD__ });
  if (!data || error) {
    console.error(error);
    return null;
  }
  return data.reduce<IFolder>((obj, x) => {
    obj[x.id] = { parentId: x.parent_id, name: x.name };
    return obj;
  }, {});
};

export const upsertFolders = async (userId: string, folders: DBFolder[]) => {
  const mappedFolders = folders.map((folder) => ({
    ...folder,
    user_id: userId,
    is_prod: __PROD__,
  }));
  const { data, error } = await supabase
    .from<definitions["bookmark_folder"]>("bookmark_folder")
    .upsert(mappedFolders);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};

export const deleteFolders = async (userId: string, folders: DBFolder[]) => {
  const foldersToDelete = folders.map((folder) => folder.id);
  const { data, error } = await supabase
    .from<definitions["bookmark_folder"]>("bookmark_folder")
    .delete()
    .match({ user_id: userId, is_prod: __PROD__ })
    .in("id", foldersToDelete);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};
