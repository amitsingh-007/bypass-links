import { getWebistes } from '@/storage';

export const isForumPage = async (hostname: string) => {
  const websites = await getWebistes();
  return Object.values(websites).some((website) => hostname.includes(website));
};
