import { z } from 'zod/mini';

export const TestAuthCredentialsSchema = z.object({
  email: z.string().check(z.minLength(1)),
  password: z.string().check(z.minLength(1)),
});
