import { ILastVisited } from "@common/interfaces/lastVisited";
import { getLastVisited, saveLastVisited } from "@database/lastVisited";
import { NextApiRequest, NextApiResponse } from "next";
import withAuth from "src/middlewares/withAuth";

/**
 * API to get shortcuts for a user
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const uid = req.query.uid as string;
  if (req.method === "GET") {
    res.json({ lastVisited: await getLastVisited(uid) });
  } else if (req.method === "POST") {
    const { lastVisited }: { lastVisited: ILastVisited | null } = JSON.parse(
      req.body
    );
    res.json({
      isSuccess: Boolean(
        lastVisited && (await saveLastVisited(uid, lastVisited))
      ),
    });
  }
};

export default withAuth(handler);
