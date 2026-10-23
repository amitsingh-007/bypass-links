import { z } from 'zod/mini';

export const LegacyAuthResponseSchema = z.object({
  uid: z.string(),
  email: z.string(),
  photoUrl: z.optional(z.string()),
  displayName: z.optional(z.string()),
  expiresAtMs: z.number(),
  idToken: z.string(),
  refreshToken: z.string(),
});

export const TestAuthCredentialsSchema = z.object({
  email: z.string().check(z.minLength(1)),
  password: z.string().check(z.minLength(1)),
});
