import { type z } from 'zod/mini';

export const getFromLocalStorage = <T>(
  key: string,
  schema: z.ZodMiniType<T>
): T | null => {
  const data = localStorage.getItem(key);
  return data ? schema.parse(JSON.parse(data)) : null;
};

export const setToLocalStorage = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value));
