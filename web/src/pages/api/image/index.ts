import { removeImage, uploadImage } from "@database/storage";
import runMiddleware from "@middlewares/runMiddleware";
import withAuth from "@middlewares/withAuth";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// * Disable default parser to parse image
export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiRequestWithFile = NextApiRequest & {
  files?: Express.Multer.File[] | null;
};

/**
 * API to get, save and delete an image
 */
const handler = async (
  req: NextApiRequestWithFile,
  res: NextApiResponse<any>
) => {
  const uid = req.query.uid as string;
  if (req.method === "POST") {
    await runMiddleware(req, res, upload.any());
    const imageFile =
      req.files?.length === 1 ? (<Express.Multer.File[]>req.files)[0] : null;
    res.json({
      isSuccess: Boolean(imageFile && (await uploadImage(uid, imageFile))),
    });
  } else if (req.method === "DELETE") {
    const imagePath = req.query.imagePath as string;
    res.json({
      isSuccess: Boolean(imagePath && (await removeImage(uid, imagePath))),
    });
  }
};

export default withAuth(handler);
