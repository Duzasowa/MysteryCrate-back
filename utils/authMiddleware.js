import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "./Logger.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Token fetching
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const now = new Date().getTime() / 1000; // Current time in seconds

      if (decoded.exp < now) {
        return res.status(401).json({ message: "Token expired" });
      }

      req.user = await User.findById(decoded.userId).select("-password");
      next(); // Token is valid, move to the next middleware or route
    } catch (error) {
      logger.error(error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
