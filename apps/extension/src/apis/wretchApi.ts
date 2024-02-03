import { getAuthIdToken } from '@/helpers/firebase/auth';
import wretch from 'wretch';

export const wretchApi = async () =>
  wretch(`${HOST_NAME}/api`).auth(`Bearer ${await getAuthIdToken()}`);
