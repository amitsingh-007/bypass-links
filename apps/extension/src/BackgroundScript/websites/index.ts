import { getWebistes } from '@/helpers/fetchFromStorage';

export const isForumPage = async (hostname: string) => {
  const websites = await getWebistes();
  return Object.values(websites).some((website) => hostname.includes(website));
};
