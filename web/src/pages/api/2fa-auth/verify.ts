import { Verify2FAResponse } from '@common/interfaces/twoFactorAuth';
import { verify2FA } from '@logic/twoFactorAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuth from 'src/middlewares/withAuth';

/**
 * API to verify the user while setting up 2FA
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Verify2FAResponse>
) => {
  const { uid, totp } = req.query as { [key: string]: string };
  const isVerified = await verify2FA({ uid, totp });
  res.json({ isVerified });
};

export default withAuth(handler);
