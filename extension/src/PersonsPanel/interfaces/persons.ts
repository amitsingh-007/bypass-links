interface Person {
  uid: string;
  name: string;
  imageRef: string;
  taggedUrls: string[];
}

export type Persons = Record<string, Person>;

export interface UpdateTaggedPersons {
  prevTaggedPersons: string[];
  newTaggedPersons: string[];
  urlHash: string;
}
