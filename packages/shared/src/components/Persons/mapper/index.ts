import { IPerson } from '../interfaces/persons';

export const decryptionMapper = ([_key, { uid, name, imageRef, taggedUrls }]: [
  key: string,
  value: IPerson,
]): IPerson => ({
  uid,
  name: atob(name),
  imageRef: decodeURIComponent(atob(imageRef)),
  taggedUrls,
});
