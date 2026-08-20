export const noOp = () => {};

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Rebuild a keyed record, keeping only entries for which `shouldKeep` returns true
export const filterRecord = <T>(
  record: Record<string, T>,
  shouldKeep: (id: string, value: T) => boolean
) =>
  Object.fromEntries(
    Object.entries(record).filter(([id, value]) => shouldKeep(id, value))
  );
