import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { ALLOWED_ORIGIN } from "../constants";
import runMiddleware from "./runMiddleware";
import verifyUserId from "./verifyUserId";

const withAuth = (handler) => async (req, res) => {
  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20,
  });
  runMiddleware(req, res, morgan("common"));
  runMiddleware(req, res, helmet());
  runMiddleware(req, res, compression());
  runMiddleware(req, res, apiLimiter);
  if (__PROD__) {
    runMiddleware(req, res, cors({ origin: ALLOWED_ORIGIN }));
  }
  runMiddleware(req, res, verifyUserId);
  return handler(req, res);
};

export default withAuth;
