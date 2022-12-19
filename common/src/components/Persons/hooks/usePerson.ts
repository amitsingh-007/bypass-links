import { useCallback } from 'react';
import useStorage from '../../../hooks/useStorage';
import { CACHE_BUCKET_KEYS } from '../../../constants/cache';
import { getBlobUrlFromCache } from '../../../utils/cache';
import { IPerson, IPersonWithImage } from '../interfaces/persons';
import { decodePersons } from '../utils';

const usePerson = () => {
  const { getPersons, getPersonImageUrls } = useStorage();

  const getAllDecodedPersons = useCallback(async () => {
    const persons = await getPersons();
    if (!persons) return [];
    return decodePersons(persons);
  }, [getPersons]);

  const resolvePersonImageFromUid = useCallback(
    async (uid: string) => {
      const personImages = await getPersonImageUrls();
      if (!personImages) {
        return '';
      }
      const imageUrl = personImages[uid];
      return await getBlobUrlFromCache(CACHE_BUCKET_KEYS.person, imageUrl);
    },
    [getPersonImageUrls]
  );

  const getPersonsWithImageUrl = useCallback(
    async (persons: IPerson[]): Promise<IPersonWithImage[]> => {
      if (!persons) {
        return [];
      }
      return await Promise.all(
        persons.map(async (person) => ({
          ...person,
          imageUrl: await resolvePersonImageFromUid(person.uid),
        }))
      );
    },
    [resolvePersonImageFromUid]
  );

  return {
    getAllDecodedPersons,
    resolvePersonImageFromUid,
    getPersonsWithImageUrl,
  };
};

export default usePerson;
