import { getBookmarks, saveBookmarks } from "@logic/bookmarks";
import withAuth from "@middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get and save persons
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const uid = req.query.uid as string;
  if (req.method === "GET") {
    res.json({ bookmarks: await getBookmarks(uid) });
  } else if (req.method === "POST") {
    const { bookmarks }: { bookmarks: any } = JSON.parse(req.body);
    res.json({
      isSuccess: Boolean(bookmarks && (await saveBookmarks(uid, bookmarks))),
    });
  }
};

export default withAuth(handler);
