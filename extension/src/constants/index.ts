import { STORAGE_KEYS } from '@bypass/common/constants/storage';

export enum EXTENSION_STATE {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum BYPASS_KEYS {
  LINKVERTISE = 'LINKVERTISE',
  LINKVERTISE_DOWNLOAD = 'LINKVERTISE_DOWNLOAD',
  BONSAI = 'BONSAI',
  BONSAILINK = 'BONSAILINK',
  FORUMS = 'FORUMS',
  JUSTPASTEIT = 'JUSTPASTEIT',
  PASTELINK = 'PASTELINK',
  RENTRY = 'RENTRY',
  MEDIUM = 'MEDIUM',
  FORUMS_V2 = 'FORUMS_V2',
}

export const FIREBASE_STORAGE_REF = {
  persons: STORAGE_KEYS.persons,
};
