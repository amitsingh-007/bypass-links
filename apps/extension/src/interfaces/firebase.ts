import { z } from 'zod/mini';

export const FirebaseProfileStateSchema = z.object({
  idpAuth: z.nullable(
    z.object({
      uid: z.string().check(z.minLength(1)),
      displayName: z.nullable(z.string()),
      photoURL: z.nullable(z.string()),
    })
  ),
});

export const TestAuthCredentialsSchema = z.object({
  email: z.string().check(z.minLength(1)),
  password: z.string().check(z.minLength(1)),
});
