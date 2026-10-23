export const encodeText = (value: string) => btoa(encodeURIComponent(value));

export const decodeText = (value: string) => decodeURIComponent(atob(value));

/** Only for pre-codec name records, whose literal percent escapes must survive. */
export const encodeLegacyNames = <T extends { name: string }>(
  records: Record<string, T>
): Record<string, T> =>
  Object.fromEntries(
    Object.entries(records).map(([key, record]) => [
      key,
      { ...record, name: encodeText(atob(record.name)) },
    ])
  );
