import supabase from "@helpers/supabase";
import { ILastVisited } from "@common/interfaces/lastVisited";
import { definitions } from "../@types/supabase";

export const getLastVisited = async (
  userId: string
): Promise<ILastVisited[] | null> => {
  const { data, error } = await supabase
    .from<definitions["last_visited"]>("last_visited")
    .select("hostname, visited_on")
    .match({ user_id: userId, is_prod: __PROD__ });
  if (!data || error) {
    console.error(error);
    return null;
  }
  return data.map((x) => ({
    hostname: x.hostname,
    visitedOn: x.visited_on,
  }));
};

export const saveLastVisited = async (
  userId: string,
  lastVisited: ILastVisited
) => {
  const { data, error } = await supabase
    .from<definitions["last_visited"]>("last_visited")
    .upsert([
      {
        user_id: userId,
        is_prod: __PROD__,
        hostname: lastVisited.hostname,
        visited_on: lastVisited.visitedOn,
      },
    ]);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};
