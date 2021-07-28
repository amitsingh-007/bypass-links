import { IPerson } from "@common/interfaces/person";
import supabase from "@helpers/supabase";
import { definitions } from "src/@types/supabase";

export const getPersons = async (userId: string): Promise<IPerson[] | null> => {
  const { data, error } = await supabase.rpc<IPerson>("get_persons", {
    userid: userId,
    isprod: __PROD__,
  });
  if (!data || error) {
    console.error(error);
    return null;
  }
  return data;
};

export const upsertPersons = async (
  userId: string,
  persons: Omit<IPerson, "taggedUrls">[]
) => {
  const mappedPersons = persons.map((x) => ({
    user_id: userId,
    is_prod: __PROD__,
    id: x.id,
    name: x.name,
    image_path: x.imagePath,
  }));
  const { data, error } = await supabase
    .from<definitions["person"]>("person")
    .upsert(mappedPersons);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};

export const deletePersons = async (
  userId: string,
  persons: Omit<IPerson, "taggedUrls">[]
) => {
  const personsToDelete = persons.map((person) => person.id);
  const { data, error } = await supabase
    .from<definitions["person"]>("person")
    .delete()
    .match({ user_id: userId, is_prod: __PROD__ })
    .in("id", personsToDelete);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};
