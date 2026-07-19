export const getGoogleFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

export const getYandexFaviconUrl = (url: string) =>
  `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;

export const noOp = () => {};
export const asyncNoOp = async () => {};

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Transform every value of a record, preserving its keys
export const mapValues = <K extends string, V>(
  record: Record<K, V>,
  transform: (value: V) => V
): Record<K, V> =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, transform(value as V)])
  ) as Record<K, V>;

// Rebuild a keyed record, keeping only entries for which `shouldKeep` returns true
export const filterRecord = <T>(
  record: Record<string, T>,
  shouldKeep: (id: string, value: T) => boolean
) =>
  Object.entries(record).reduce<Record<string, T>>((acc, [id, value]) => {
    if (shouldKeep(id, value)) {
      acc[id] = value;
    }
    return acc;
  }, {});
