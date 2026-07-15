import {
  sortAlphabetically,
  sortByRecency,
  useBookmark,
  usePerson,
} from '@bypass/shared';
import useSWR from 'swr';

const usePersonsWithImages = (orderByRecency: boolean) => {
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();
  const { getDefaultOrRootFolderUrls } = useBookmark();

  return useSWR(['persons-with-images', orderByRecency], async () => {
    const decodedPersons = await getAllDecodedPersons();
    const urls = await getDefaultOrRootFolderUrls();
    const personsWithImageUrl = await getPersonsWithImageUrl(decodedPersons);

    return orderByRecency
      ? sortByRecency(personsWithImageUrl, urls)
      : sortAlphabetically(personsWithImageUrl);
  });
};

export default usePersonsWithImages;
