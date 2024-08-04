import { IPerson } from '../interfaces/persons';

export const decryptionMapper = ([_key, { uid, name }]: [
  key: string,
  value: IPerson,
]): IPerson => ({
  uid,
  name: atob(name),
});
