import { type IPersonWithImage } from '../interfaces/persons';
import useAllPersonsWithImages from './useAllPersonsWithImages';

/** Selects a row's tagged persons from the one shared all-persons entry. */
const useTaggedPersons = (taggedPersons: string[]) => {
  const { data: allPersons = [], ...rest } = useAllPersonsWithImages();

  const tagged = new Set(taggedPersons);
  // Filter rather than map over taggedPersons, to keep persons-storage ordering
  const data: IPersonWithImage[] = allPersons.filter((person) =>
    tagged.has(person.uid)
  );

  return { ...rest, data };
};

export default useTaggedPersons;
