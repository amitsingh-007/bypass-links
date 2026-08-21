export const noOp = () => {};

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const filterRecord = <T>(
  record: Record<string, T>,
  shouldKeep: (id: string, value: T) => boolean
) =>
  Object.fromEntries(
    Object.entries(record).filter(([id, value]) => shouldKeep(id, value))
  );
