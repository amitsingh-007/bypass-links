import {
  decodePersons,
  type IPerson,
  type IPersons,
  invalidatePersonKeys,
} from '@bypass/shared';

import { personsItem, hasPendingPersonsItem } from '@/storage/items';

export const setPersonsInStorage = async (persons: IPersons, uid?: string) => {
  await Promise.all([
    personsItem.setValue(persons),
    hasPendingPersonsItem.setValue(true),
  ]);
  await invalidatePersonKeys(uid);
};

export const getAllDecodedPersons = async () => {
  const persons = await personsItem.getValue();
  return decodePersons(persons);
};

export const getPersonPos = (persons: IPerson[], person: IPerson) =>
  persons.findIndex(({ uid }) => uid === person.uid);
