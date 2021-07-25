import supabase from "@helpers/supabase";
import { IBypassSite } from "@common/interfaces/bypassSites";
import { definitions } from "../@types/supabase";

export const getBypassSites = async (
  userId: string
): Promise<IBypassSite[] | null> => {
  const { data, error } = await supabase
    .from<definitions["bypass_sites"]>("bypass_sites")
    .select("hostname, name")
    .match({ user_id: userId, is_prod: __PROD__ });
  if (!data || error) {
    console.error(error);
    return null;
  }
  return data;
};
