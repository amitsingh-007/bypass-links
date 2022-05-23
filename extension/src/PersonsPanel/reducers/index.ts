import { UPDATE_TAGGED_PERSON_URLS } from '../actionTypes';
import { TaggedPersonsAction, TaggedPersonsState } from '../interfaces/reducer';

const defaultState = {
  updateTaggedUrls: null,
};

const personsReducer = (
  state: TaggedPersonsState = defaultState,
  action: TaggedPersonsAction
): TaggedPersonsState => {
  switch (action.type) {
    case UPDATE_TAGGED_PERSON_URLS:
      return {
        ...state,
        updateTaggedUrls: action.data,
      };
    default:
      return defaultState;
  }
};

export default personsReducer;
