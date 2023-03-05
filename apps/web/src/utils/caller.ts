import { appRouter } from '@bypass/trpc';
import { GetServerSidePropsContext } from 'next';
import requestIp from 'request-ip';

export const getCaller = ({ req }: GetServerSidePropsContext) =>
  appRouter.createCaller({
    reqMetaData: {
      ip: requestIp.getClientIp(req),
      userAgent: req.headers['user-agent'],
    },
  });
