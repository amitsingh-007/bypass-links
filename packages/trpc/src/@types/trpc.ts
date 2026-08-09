import { type AuthorizationResult } from '../utils/authorization';

export interface IUser {
  readonly uid: string;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly disabled: boolean;
}

export interface ITRPCContext {
  auth: AuthorizationResult;
}
