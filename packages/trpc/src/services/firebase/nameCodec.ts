import {
  decodeName,
  encodeLegacyNames,
  encodeLegacyText,
  isEncodedName,
  type NameRecord,
} from '@bypass/shared/server';

export const getNamesForClient = <T extends NameRecord>(
  records: Record<string, T>,
  nameCodecVersion?: 2
): Record<string, T> => {
  const current = encodeLegacyNames(records);
  if (nameCodecVersion === 2) {
    return current;
  }
  return Object.fromEntries(
    Object.entries(current).map(([key, record]) => {
      const legacy = { ...record, name: encodeLegacyText(decodeName(record)) };
      delete legacy.nameEncoding;
      return [key, legacy];
    })
  );
};

export const normalizeSavedNames = <T extends NameRecord>(
  records: Record<string, T>,
  previous: Record<string, T>
): Record<string, T> => {
  const current = encodeLegacyNames(records);
  return Object.fromEntries(
    Object.entries(records).map(([key, record]) => {
      const existing = previous[key];
      // Old full saves strip markers; retain text they received unchanged.
      const keepExisting =
        !isEncodedName(record) &&
        existing &&
        record.name === encodeLegacyText(decodeName(existing));
      return [
        key,
        keepExisting
          ? {
              ...record,
              name: existing.name,
              nameEncoding: existing.nameEncoding,
            }
          : current[key],
      ];
    })
  );
};
