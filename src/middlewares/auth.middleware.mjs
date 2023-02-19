import { expressjwt } from "express-jwt";
import { JWT_SECRET } from "../config.mjs";

export const requireSignIn = expressjwt({
  secret: JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

export const hasAuthorization = (req, res, next) => {
  console.log("Profile ->", req.profile);
  console.log("Auth ->", req.auth);
  const authorized =
    req.profile && req.auth && req.profile._id.toString() === req.auth._id;
  if (!authorized) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};

export default { requireSignIn, hasAuthorization };
