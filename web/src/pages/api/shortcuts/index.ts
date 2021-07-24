import { NextApiRequest, NextApiResponse } from "next";
import withAuth from "src/middlewares/withAuth";
import { getShortcuts, saveShortcuts } from "@database/shortcuts";
import { IShortcut } from "@common/interfaces/shortcuts";

/**
 * API to get shortcuts for a user
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const uid = req.query.uid as string;
  if (req.method === "GET") {
    res.json({ shortcuts: await getShortcuts(uid) });
  } else if (req.method === "POST") {
    const { shortcuts }: { shortcuts: IShortcut[] | null } = JSON.parse(
      req.body
    );
    res.json({
      isSuccess: Boolean(shortcuts && (await saveShortcuts(uid, shortcuts))),
    });
  }
};

export default withAuth(handler);
