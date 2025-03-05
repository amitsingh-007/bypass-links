import { ITRPCContext } from '../src/@types/trpc';
import { appRouter } from '../src/index';
import { t } from '../src/trpc';
import { getUser } from './firebase';

const createInnerTRPCContext = (): ITRPCContext => {
  const innerCtx: ITRPCContext = {
    reqMetaData: {
      ip: '',
      userAgent: '',
    },
    user: null,
  };
  const firebaseUser = getUser();
  if (!firebaseUser) {
    return innerCtx;
  }

  innerCtx.user = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? undefined,
    displayName: firebaseUser.displayName ?? undefined,
    photoURL: firebaseUser.photoURL ?? undefined,
    disabled: false,
    emailVerified: true,
  };
  return innerCtx;
};

export const getTrpcCaller = () => {
  const ctx = createInnerTRPCContext();
  return t.createCallerFactory(appRouter)(ctx);
};
