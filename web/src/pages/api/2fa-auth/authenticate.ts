import { Authenticate2FAResponse } from '@common/interfaces/twoFactorAuth';
import { authenticate2FA } from '@logic/twoFactorAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuth from 'src/middlewares/withAuth';

/**
 * API to authenticate the user when he tries to login
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Authenticate2FAResponse>
) => {
  const { uid, totp } = req.query as { [key: string]: string };
  const isVerified = await authenticate2FA({ uid, totp });
  res.json({ isVerified });
};

export default withAuth(handler);
