export const getAuthBearer = (req: Request) =>
  req.headers.get('authorization')?.split?.('Bearer ')?.[1];
