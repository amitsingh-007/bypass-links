/* eslint-disable @typescript-eslint/ban-ts-comment */
import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
// @ts-ignore
import requestIp from 'request-ip';

type CreateContextOptions = Record<string, never>;

export const createInnerTRPCContext = async (_opts: CreateContextOptions) => {
  return {};
};

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  const { req } = _opts;
  const detectedIp = requestIp.getClientIp(req);
  console.log('ip', detectedIp);
  // @ts-ignore
  const forwarded = req.headers['x-forwarded-for'];
  console.log('forwarded', forwarded);
  // @ts-ignore
  console.log('remoteAddress', req?.socket?.remoteAddress);
  console.log('headers', req.headers);
  console.log('headers str', JSON.stringify(req.headers));
  const compIp =
    typeof forwarded === 'string'
      ? forwarded.split(/, /)[0]
      : // @ts-ignore
        req?.socket?.remoteAddress;
  console.log('compIp', compIp);
  return createInnerTRPCContext({});
};

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
  });
