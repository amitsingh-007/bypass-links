import { type AuthorizationResult } from '../utils/authorization';

export interface IUser {
  readonly uid: string;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly photoURL?: string;
}

export interface ITRPCContext {
  auth: AuthorizationResult;
}
