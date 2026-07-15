import useSWR from 'swr';

import { type IPerson } from '../interfaces/persons';
import usePerson from './usePerson';

const getPersonsFromUids = (uids: string[], persons: IPerson[]) => {
  if (!uids || !persons) {
    return [];
  }
  return persons.filter((person) => uids.includes(person.uid ?? ''));
};

const useTaggedPersons = (taggedPersons: string[]) => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();

  return useSWR(['tagged-persons', taggedPersons], async () => {
    const allPersons = await getAllDecodedPersons();
    const persons = getPersonsFromUids(taggedPersons, allPersons);
    return getPersonsWithImageUrl(persons);
  });
};

export default useTaggedPersons;
