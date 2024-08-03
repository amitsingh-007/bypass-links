import { z } from 'zod';
import { SettingsSchema } from '../schema/settingsSchema';

export type ISettings = z.infer<typeof SettingsSchema>;
