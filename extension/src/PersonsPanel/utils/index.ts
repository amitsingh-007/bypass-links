import { IPerson } from "@common/interfaces/person";
import { STORAGE_KEYS } from "GlobalConstants";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import storage from "GlobalHelpers/chrome/storage";
import { getPersons } from "GlobalHelpers/fetchFromStorage";
import { getBlobUrlFromCache } from "GlobalUtils/cache";
import { IPersonWithImage } from "../interfaces/persons";

export const setPersonsInStorage = async (persons: IPerson[]) => {
  await storage.set({
    [STORAGE_KEYS.persons]: persons,
    [STORAGE_KEYS.hasPendingPersons]: true,
  });
};

export const getPersonsFromUids = async (uids: string[]) => {
  if (!uids) {
    return [];
  }
  const persons = await getPersons();
  return persons.filter((person) => uids.includes(person.id ?? ""));
};

export const getPersonsWithImageUrl = async (
  persons: IPerson[]
): Promise<IPersonWithImage[]> => {
  if (!persons) {
    return [];
  }
  return await Promise.all(
    persons.map(async (person) => ({
      ...person,
      imageUrl: await resolveImageFromPersonId(person.id),
    }))
  );
};

export const resolveImageFromPersonId = async (id: string) => {
  const { [STORAGE_KEYS.personImageUrls]: personImages } = await storage.get(
    STORAGE_KEYS.personImageUrls
  );
  if (!personImages) {
    return "";
  }
  const imageUrl = personImages[id];
  return await getBlobUrlFromCache(CACHE_BUCKET_KEYS.person, imageUrl);
};

export const getPersonPos = (persons: IPerson[], person: IPerson) =>
  persons.findIndex(({ id }) => id === person.id);
