import { IUpdateTaggedPerson } from '@common/components/Persons/interfaces/persons';

export interface TaggedPersonsAction {
  type: string;
  data: IUpdateTaggedPerson[];
}

export interface TaggedPersonsState {
  updateTaggedUrls: IUpdateTaggedPerson[] | null;
}
