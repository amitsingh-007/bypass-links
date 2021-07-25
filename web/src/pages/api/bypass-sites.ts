import { IBypassSite } from "@common/interfaces/bypassSites";
import { getBypassSites } from "@database/bypassSites";
import withAuth from "@middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get shortcuts for a user
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ bypassSites: IBypassSite[] | null }>
) => {
  const uid = req.query.uid as string;
  res.json({ bypassSites: await getBypassSites(uid) });
};

export default withAuth(handler);
