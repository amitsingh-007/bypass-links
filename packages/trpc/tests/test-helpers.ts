import { ITRPCContext } from '../src/@types/trpc';
import { appRouter } from '../src/index';
import { getAuthIdToken } from './firebase';

const createInnerTRPCContext = async (): Promise<ITRPCContext> => {
  return {
    reqMetaData: {
      ip: '',
      userAgent: '',
    },
    bearerToken: await getAuthIdToken(),
  };
};

export const getTrpcCaller = async () => {
  const ctx = await createInnerTRPCContext();
  return appRouter.createCaller(ctx);
};
