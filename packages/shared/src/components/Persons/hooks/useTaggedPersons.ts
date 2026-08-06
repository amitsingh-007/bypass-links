import { type IPersonWithImage } from '../interfaces/persons';
import useAllPersonsWithImages from './useAllPersonsWithImages';

const useTaggedPersons = (taggedPersons: string[]) => {
  const { data: allPersons = [], ...rest } = useAllPersonsWithImages();

  const tagged = new Set(taggedPersons);
  const data: IPersonWithImage[] = allPersons.filter((person) =>
    tagged.has(person.uid)
  );

  return { ...rest, data };
};

export default useTaggedPersons;
