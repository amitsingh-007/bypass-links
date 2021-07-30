import { getBookmarks } from "@database/bookmarks";
import withAuth from "@middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get and save persons
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const uid = req.query.uid as string;
  if (req.method === "GET") {
    res.json({ bookmarks: await getBookmarks(uid) });
  }
};

export default withAuth(handler);
