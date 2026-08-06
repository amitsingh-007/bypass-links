export interface IAuthResponse {
  readonly uid: string;
  readonly email: string;
  readonly photoUrl?: string;
  readonly displayName?: string;
  readonly expiresAtMs: number;
  readonly idToken: string;
  readonly refreshToken: string;
}

/** Raw shape returned by the Identity Toolkit sign-in endpoints. */
export interface IIdentityAuthResponse {
  readonly localId: string;
  readonly email: string;
  readonly photoUrl?: string;
  readonly displayName?: string;
  readonly idToken: string;
  readonly expiresIn: string;
  readonly refreshToken: string;
}

export interface IRefreshTokenResponse {
  readonly expiresIn: number;
  readonly idToken: string;
  readonly refreshToken: string;
}
