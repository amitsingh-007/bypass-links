import { type IPersonWithImage } from '../interfaces/persons';
import useAllPersonsWithImages from './useAllPersonsWithImages';

/**
 * Selects a bookmark row's tagged persons out of the one shared all-persons
 * entry. Previously every row ran its own fetcher, re-reading storage and
 * re-decoding every person name per row.
 */
const useTaggedPersons = (taggedPersons: string[]) => {
  const { data: allPersons = [], ...rest } = useAllPersonsWithImages();

  const tagged = new Set(taggedPersons);
  // Filter the list rather than mapping over taggedPersons, to preserve the
  // persons-storage ordering the previous implementation produced
  const data: IPersonWithImage[] = allPersons.filter((person) =>
    tagged.has(person.uid)
  );

  return { ...rest, data };
};

export default useTaggedPersons;
