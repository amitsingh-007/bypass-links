import {
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
} from 'GlobalActionTypes/extension';
import { ExtensionAction } from 'GlobalReducers/interfaces/extension';

export const turnOnExtension = (): ExtensionAction => ({
  type: TURN_ON_EXTENSION,
});

export const turnOffExtension = (): ExtensionAction => ({
  type: TURN_OFF_EXTENSION,
});
