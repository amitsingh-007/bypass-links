import { IPerson } from "@common/interfaces/person";

export interface IUpdateTaggedPerson {
  prevTaggedPersons: string[];
  newTaggedPersons: string[];
  urlHash: string;
}

export type PersonImageUrls = Record<string, string>;

export interface IPersonWithImage extends IPerson {
  imageUrl: string;
}
