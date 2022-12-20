import { Status2FAResponse } from '@bypass/shared/interfaces/twoFactorAuth';
import { fetchUser2FAInfo, is2FAEnabled } from '@logic/twoFactorAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuth from 'src/middlewares/withAuth';

/**
 * API which indicates whether 2FA is enabled by the user or not
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Status2FAResponse>
) => {
  const uid = <string>req.query.uid;
  const user2FAInfo = await fetchUser2FAInfo(uid);
  res.json({ is2FAEnabled: is2FAEnabled(user2FAInfo) });
};

export default withAuth(handler);
