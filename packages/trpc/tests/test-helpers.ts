import { appRouter } from '../src/index';

const createInnerTRPCContext = () => {
  return {
    reqMetaData: {
      ip: '',
      userAgent: '',
    },
  };
};

export const getTrpcCaller = async () => {
  const ctx = createInnerTRPCContext();
  return appRouter.createCaller(ctx);
};
