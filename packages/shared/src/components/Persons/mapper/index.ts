import { IPerson } from '../interfaces/persons';

export const decryptionMapper = ([_key, { uid, name, taggedUrls }]: [
  key: string,
  value: IPerson,
]): IPerson => ({
  uid,
  name: atob(name),
  taggedUrls,
});
