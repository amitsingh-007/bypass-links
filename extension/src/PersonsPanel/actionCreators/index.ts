import { UPDATE_TAGGED_PERSON_URLS } from '../actionTypes';
import { IUpdateTaggedPerson } from '../interfaces/persons';
import { TaggedPersonsAction } from '../interfaces/reducer';

export const updateTaggedPersonUrls = (
  data: IUpdateTaggedPerson[]
): TaggedPersonsAction => ({
  type: UPDATE_TAGGED_PERSON_URLS,
  data,
});
