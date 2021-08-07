import { IBookmarkUrl } from "@common/interfaces/bookmark";
import supabase from "@helpers/supabase";

export const getUrls = async (userId: string): Promise<IBookmarkUrl | null> => {
  const { data, error } = await supabase.rpc<IBookmarkUrl>("get_bookmarks", {
    userid: userId,
    isprod: __PROD__,
  });
  if (!data || error) {
    console.error(error);
    return null;
  }
  return data as unknown as IBookmarkUrl;
};
