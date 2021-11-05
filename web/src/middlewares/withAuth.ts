import { ALLOWED_ORIGIN } from "@constants/index";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { NextApiRequest, NextApiResponse } from "next";
import runMiddleware from "./runMiddleware";
import verifyUserId from "./verifyUserId";

interface Handler {
  (req: NextApiRequest, res: NextApiResponse): Promise<void>;
}

const withAuth =
  (handler: Handler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const apiLimiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 20,
    });
    await runMiddleware(req, res, helmet());
    await runMiddleware(req, res, apiLimiter);
    if (__PROD__) {
      await runMiddleware(req, res, cors({ origin: ALLOWED_ORIGIN }));
    }
    await runMiddleware(req, res, verifyUserId);
    return handler(req, res);
  };

export default withAuth;
