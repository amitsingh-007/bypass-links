import { getImageUrl } from "@database/storage";
import withAuth from "@middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get, save and delete an image
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, imagePaths } = req.query as Record<string, string>;
  const imagePathList = imagePaths.split(",");
  const imageUrls = await Promise.all(
    imagePathList.map((imagePath) => getImageUrl(uid, imagePath))
  );
  res.json({ imageUrls });
};

export default withAuth(handler);
