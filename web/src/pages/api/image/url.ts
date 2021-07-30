import { getImageUrl } from "@database/storage";
import withAuth from "@middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get, save and delete an image
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const { uid, imagePath } = req.query as Record<string, string>;
  res.json({ imageUrl: imagePath && (await getImageUrl(uid, imagePath)) });
};

export default withAuth(handler);
