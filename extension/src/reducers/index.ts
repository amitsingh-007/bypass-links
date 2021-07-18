import { SET_SIGNED_IN_STATUS } from "GlobalActionTypes";

const defaultState = {
  isSignedIn: false,
};

const reducer = (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_SIGNED_IN_STATUS:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
      };
    default:
      return state;
  }
};

export default reducer;
