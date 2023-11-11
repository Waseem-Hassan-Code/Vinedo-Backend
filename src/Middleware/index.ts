import { Request, Response, NextFunction } from "express";
import { readToken } from "../Helpers/jwtTokens";

interface CustomRequest extends Request {
  user: any;
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const decoded = readToken(token);

  if (!decoded) {
    return res.status(400).json({ message: "Invalid token" });
  }

  req.user = decoded;
  next();
};
