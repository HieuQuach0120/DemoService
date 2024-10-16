import jwt from "jsonwebtoken";
import logger from "../common/loggerWinston";
import ResponseData from "../models/ResponeData";
// import { autoSetTimeActive } from "../controllers/AuthenController";

const authAllowedUrls = [
  "/api/v1/authen/login",
  "/api/v1/authen/logout",
  "/api/v1/authen/forgot-password",
  "/api/v1/membership-registration",
];

// check authenfication
const authenMiddleware = async function (req: any, res: any, next: any) {
  try {
    logger.info("Time authenMiddleware --------: " + req.originalUrl);
    console.log("Time authenMiddleware --------: ", req.originalUrl);
    if (authAllowedUrls.includes(req.originalUrl)) {
      next();
    } else if (req.headers.authorization) {
      const token = req.headers.authorization;
      jwt.verify(
        token.split(" ")[1],
        String(process.env.SECRETKEY),
        async (err: any, decoded: any) => {
          if (err) {
            res
              .status(401)
              .json(
                new ResponseData(
                  "",
                  "You have logged out, please log in again."
                )
              );
          } else {
            // autoSetTimeActive(req, res);
            req.headers.memberId = decoded.id;
            req.headers.role = decoded.role;
            next();
          }
        }
      );
    } else {
      res
        .status(401)
        .json(
          new ResponseData("", "You have logged out, please log in again.")
        );
    }
  } catch (error: any) {
    logger.error(error.toString());
  }
};

export default authenMiddleware;
