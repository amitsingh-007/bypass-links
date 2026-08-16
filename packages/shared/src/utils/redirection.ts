import { type IRedirection } from '../interfaces/IRedirection';

/** Field by field, mirroring the bookmark and person codecs. */
export const getEncryptedRedirection = ({
  alias,
  website,
  isDefault,
}: IRedirection): IRedirection => ({
  alias: btoa(alias),
  website: btoa(website),
  isDefault,
});

export const getDecryptedRedirection = ({
  alias,
  website,
  isDefault,
}: IRedirection): IRedirection => ({
  alias: atob(alias),
  website: atob(website),
  isDefault,
});
