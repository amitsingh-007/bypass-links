export interface IPerson {
  uid: string;
  name: string;
  taggedUrls: string[];
}

export type IPersons = Record<string, IPerson>;

export interface IUpdateTaggedPerson {
  prevTaggedPersons: string[];
  newTaggedPersons: string[];
  urlHash: string;
}

export type PersonImageUrls = Record<string, string>;

export interface IPersonWithImage extends IPerson {
  imageUrl: string;
}
