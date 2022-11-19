import { IPerson, IPersons } from '../interfaces/persons';

export const decodePerson = (person: IPerson): IPerson => {
  const { uid, imageRef, name, taggedUrls } = person;
  return {
    uid,
    name: atob(name),
    imageRef: decodeURIComponent(atob(imageRef)),
    taggedUrls,
  };
};

export const decodePersons = (persons: IPersons) =>
  Object.entries(persons)
    .filter(Boolean)
    .map(([_key, person]) => decodePerson(person));
