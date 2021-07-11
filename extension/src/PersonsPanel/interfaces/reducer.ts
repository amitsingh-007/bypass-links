import { UpdateTaggedPersons } from "./persons";

export interface TaggedPersonsAction {
  type: string;
  data: UpdateTaggedPersons[];
}

export interface TaggedPersonsState {
  updateTaggedUrls: UpdateTaggedPersons[] | null;
}
