import { z } from 'zod/mini';

export const AuthResponseSchema = z.object({
  uid: z.string(),
  email: z.string(),
  photoUrl: z.optional(z.string()),
  displayName: z.optional(z.string()),
  expiresAtMs: z.number(),
  idToken: z.string(),
  refreshToken: z.string(),
});

export type IAuthResponse = Readonly<z.infer<typeof AuthResponseSchema>>;

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
