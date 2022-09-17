import helmet from 'helmet';
import { NextApiRequest, NextApiResponse } from 'next';
import runMiddleware from './runMiddleware';
import verifyUserId from './verifyUserId';

interface Handler {
  (req: NextApiRequest, res: NextApiResponse): Promise<void>;
}

const withAuth =
  (handler: Handler) => async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, helmet());
    await runMiddleware(req, res, verifyUserId);
    return handler(req, res);
  };

export default withAuth;
