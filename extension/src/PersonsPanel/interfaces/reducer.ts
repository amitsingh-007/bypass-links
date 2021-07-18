import { IUpdateTaggedPerson } from "./persons";

export interface TaggedPersonsAction {
  type: string;
  data: IUpdateTaggedPerson[];
}

export interface TaggedPersonsState {
  updateTaggedUrls: IUpdateTaggedPerson[] | null;
}
