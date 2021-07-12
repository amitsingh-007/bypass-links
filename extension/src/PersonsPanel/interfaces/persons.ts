export interface IPerson {
  uid: string;
  name: string;
  imageRef: string;
  taggedUrls: string[];
}

export type Persons = Record<string, IPerson>;

export interface UpdateTaggedPersons {
  prevTaggedPersons: string[];
  newTaggedPersons: string[];
  urlHash: string;
}

export type PersonImageUrls = Record<string, string>;
