import { z } from 'zod';

export const SettingsSchema = z.object({
  hasManageGoogleActivityConsent: z.boolean(),
});
