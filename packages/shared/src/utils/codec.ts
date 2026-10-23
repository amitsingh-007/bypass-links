import type { NameEncoding } from '../schema/nameEncodingSchema';

export const encodeText = (value: string) => btoa(encodeURIComponent(value));

export const decodeText = (value: string) => decodeURIComponent(atob(value));

export interface NameRecord {
  name: string;
  nameEncoding?: NameEncoding;
}

export const isEncodedName = (record: NameRecord) =>
  record.nameEncoding?.version === 2 &&
  record.nameEncoding.value === record.name;

export const decodeName = (record: NameRecord) =>
  isEncodedName(record) ? decodeText(record.name) : atob(record.name);

export const encodeName = <T extends { name: string }>(record: T) => {
  const name = encodeText(record.name);
  return {
    ...record,
    name,
    nameEncoding: { version: 2 as const, value: name },
  };
};

// Old clients can display Latin-1 only; escaped Unicode keeps their list usable.
export const encodeLegacyText = (value: string) =>
  btoa(
    Array.from(value).some((character) => character.charCodeAt(0) > 255)
      ? encodeURIComponent(value)
      : value
  );

/** Only for pre-codec name records, whose literal percent escapes must survive. */
export const encodeLegacyNames = <T extends NameRecord>(
  records: Record<string, T>
): Record<string, T> =>
  Object.fromEntries(
    Object.entries(records).map(([key, record]) => [
      key,
      isEncodedName(record)
        ? record
        : encodeName({ ...record, name: atob(record.name) }),
    ])
  );
