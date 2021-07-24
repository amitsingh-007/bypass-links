import supabase from "@helpers/supabase";
import { IShortcut } from "@common/interfaces/shortcuts";
import { definitions } from "../@types/supabase";

export const getShortcuts = async (
  userId: string
): Promise<IShortcut[] | null> => {
  const { data, error } = await supabase
    .from<definitions["shortcuts"]>("shortcuts")
    .select("is_pinned, alias, url, priority")
    .match({ user_id: userId, is_prod: __PROD__ });
  if (!data || error) {
    console.error(error);
    return null;
  }
  return data.map((x) => ({
    alias: x.alias,
    url: x.url,
    isPinned: x.is_pinned,
    priority: x.priority,
  }));
};

export const saveShortcuts = async (userId: string, shortcuts: IShortcut[]) => {
  const mappedShorcuts = shortcuts.map((x) => ({
    user_id: userId,
    alias: x.alias,
    url: x.url,
    is_pinned: x.isPinned,
    priority: x.priority,
    is_prod: __PROD__,
  }));
  const { data, error } = await supabase
    .from<definitions["shortcuts"]>("shortcuts")
    .upsert(mappedShorcuts);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};
