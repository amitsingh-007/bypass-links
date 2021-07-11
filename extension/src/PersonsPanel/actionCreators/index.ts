import { UPDATE_TAGGED_PERSON_URLS } from "../actionTypes";
import { UpdateTaggedPersons } from "../interfaces/persons";
import { TaggedPersonsAction } from "../interfaces/reducer";

export const updateTaggedPersonUrls = (
  data: UpdateTaggedPersons[]
): TaggedPersonsAction => ({
  type: UPDATE_TAGGED_PERSON_URLS,
  data,
});
