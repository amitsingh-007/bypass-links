import storage from "ChromeApi/storage";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { STORAGE_KEYS } from "GlobalConstants";
import { ROUTES } from "GlobalConstants/routes";
import { getBlobUrlFromCache } from "GlobalUtils/cache";
import { serialzeObjectToQueryString } from "GlobalUtils/url";

export const getPersons = async () => {
  const { [STORAGE_KEYS.persons]: persons } = await storage.get(
    STORAGE_KEYS.persons
  );
  return persons;
};

export const setPersonsInStorage = async (persons) => {
  await storage.set({
    [STORAGE_KEYS.persons]: persons,
    hasPendingPersons: true,
  });
};

const decodePerson = (person) => {
  if (!person) {
    return {};
  }
  const { uid, imageRef, name } = person;
  return {
    uid,
    name: atob(name),
    imageRef: decodeURIComponent(atob(imageRef)),
  };
};

export const getPersonsFromUids = async (uids) => {
  if (!uids) {
    return [];
  }
  const persons = await getAllDecodedPersons();
  return persons.filter((person) => uids.includes(person.uid));
};

export const getAllDecodedPersons = async () => {
  const persons = await getPersons();
  return Object.entries(persons).map(([_key, person]) => decodePerson(person));
};

export const getPersonsWithImageUrl = async (persons) => {
  if (!persons) {
    return [];
  }
  return await Promise.all(
    persons.map(async (person) => ({
      ...person,
      imageUrl: await resolvePersonImageFromUid(person.uid),
    }))
  );
};

export const resolvePersonImageFromUid = async (uid) => {
  const { [STORAGE_KEYS.personImageUrls]: personImages } = await storage.get(
    STORAGE_KEYS.personImageUrls
  );
  if (!personImages) {
    return "";
  }
  const imageUrl = personImages[uid];
  return await getBlobUrlFromCache(CACHE_BUCKET_KEYS.person, imageUrl);
};

export const getPersonPos = (persons, person) =>
  persons.findIndex(({ uid }) => uid === person.uid);

export const getPersonsPanelUrl = ({ openBookmarksList }) => {
  const qsObj = {};
  if (openBookmarksList) {
    qsObj.openBookmarksList = openBookmarksList;
  }
  return `${ROUTES.PERSONS_PANEL}?${serialzeObjectToQueryString(qsObj)}`;
};
