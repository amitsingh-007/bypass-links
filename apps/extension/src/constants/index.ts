import { ObjectValues } from '@bypass/shared';

export const EXTENSION_STATE = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type IExtensionState = ObjectValues<typeof EXTENSION_STATE>;

export const BYPASS_KEYS = {
  FORUMS: 'FORUMS',
  FORUMS_V2: 'FORUMS_V2',
} as const;

export type IBypassKeys = ObjectValues<typeof BYPASS_KEYS>;

export const MAX_PANEL_SIZE = {
  WIDTH: 800,
  HEIGHT: 600,
};
