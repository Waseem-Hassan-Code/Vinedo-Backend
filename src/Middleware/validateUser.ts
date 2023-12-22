import { Request, Response, NextFunction } from "express";
import { getUserById } from "../Model/users";

interface CustomRequest extends Request {
  user: any;
}

export const isValidUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const id = req.body.userId || req.query.userId || req.params.userId;

  const user = await getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isContentCreator) {
    return res.status(401).json({ message: "Unauthorized access" });
  } else {
    next();
  }
};
