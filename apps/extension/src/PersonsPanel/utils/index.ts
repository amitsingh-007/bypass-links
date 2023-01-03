import { decodePersons, IPerson, IPersons, STORAGE_KEYS } from '@bypass/shared';
import storage from '@helpers/chrome/storage';
import { getPersons } from '@helpers/fetchFromStorage';

export const setPersonsInStorage = async (persons: IPersons) => {
  await storage.set({
    [STORAGE_KEYS.persons]: persons,
    hasPendingPersons: true,
  });
};

export const getAllDecodedPersons = async () => {
  const persons = await getPersons();
  return decodePersons(persons);
};

export const getPersonPos = (persons: IPerson[], person: IPerson) =>
  persons.findIndex(({ uid }) => uid === person.uid);
