import { type IPersonWithImage } from '../interfaces/persons';
import { sortAlphabetically } from '../utils';
import useAllPersonsWithImages from './useAllPersonsWithImages';

// Keyed on the SWR array, which is stable until the data changes, so the map is
// built once per dataset instead of once per bookmark row
const personsByUidCache = new WeakMap<
  IPersonWithImage[],
  Map<string, IPersonWithImage>
>();

const getPersonsByUid = (allPersons: IPersonWithImage[]) => {
  const cached = personsByUidCache.get(allPersons);
  if (cached) {
    return cached;
  }
  const personsByUid = new Map(
    allPersons.map((person) => [person.uid, person])
  );
  personsByUidCache.set(allPersons, personsByUid);
  return personsByUid;
};

const useTaggedPersons = (taggedPersons: string[]) => {
  const { data: allPersons = [], ...rest } = useAllPersonsWithImages();

  const personsByUid = getPersonsByUid(allPersons);
  const data = sortAlphabetically(
    taggedPersons
      .map((uid) => personsByUid.get(uid))
      .filter((person): person is IPersonWithImage => Boolean(person))
  );

  return { ...rest, data };
};

export default useTaggedPersons;
