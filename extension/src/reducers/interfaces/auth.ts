import { AuthenticationEvent } from 'GlobalInterfaces/authentication';

export interface AuthState {
  authProgress: AuthenticationEvent | null;
}

export interface AuthAction {
  type: string;
  data: AuthenticationEvent;
}
