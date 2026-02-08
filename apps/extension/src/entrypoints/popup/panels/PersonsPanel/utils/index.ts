import { decodePersons, type IPerson, type IPersons } from '@bypass/shared';
import { personsItem, hasPendingPersonsItem } from '@/storage/items';

export const setPersonsInStorage = async (persons: IPersons) => {
  await personsItem.setValue(persons);
  await hasPendingPersonsItem.setValue(true);
};

export const getAllDecodedPersons = async () => {
  const persons = await personsItem.getValue();
  return decodePersons(persons);
};

export const getPersonPos = (persons: IPerson[], person: IPerson) =>
  persons.findIndex(({ uid }) => uid === person.uid);
