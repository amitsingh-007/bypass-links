const FALLBACK_IP_ADDRESS = '0.0.0.0';

/**
 * @link https://nextjs.org/docs/app/api-reference/functions/headers#ip-address
 */
export const getIpAddress = (req: Request) => {
  const { headers } = req;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
  }
  return headers.get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
};

export const getAuthBearer = (req: Request) =>
  req.headers.get('authorization')?.split?.('Bearer ')?.[1];
