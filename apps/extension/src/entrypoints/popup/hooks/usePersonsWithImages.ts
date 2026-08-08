import {
  sortAlphabetically,
  sortByRecency,
  useAllPersonsWithImages,
  useDefaultFolderUrls,
} from '@bypass/shared';

const usePersonsWithImages = (orderByRecency: boolean) => {
  const { data: personsWithImageUrl = [], ...rest } = useAllPersonsWithImages();
  const { data: urls = [] } = useDefaultFolderUrls();

  const data = orderByRecency
    ? sortByRecency(personsWithImageUrl, urls)
    : sortAlphabetically(personsWithImageUrl);

  return { ...rest, data };
};

export default usePersonsWithImages;
