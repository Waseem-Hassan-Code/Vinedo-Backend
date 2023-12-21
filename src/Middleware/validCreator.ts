import { Request, Response, NextFunction } from "express";
import { getCreatorById, getUserById } from "../Model/users";

interface CustomRequest extends Request {
  user: any;
}

export const isValidContentCreator = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const id =
    req.body.userIdentity ||
    req.query.userIdentity ||
    req.params.userIdentity ||
    req.body.creatorId ||
    req.query.creatorId ||
    req.params.creatorId;

  const user = await getCreatorById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.isContentCreator) {
    return res.status(401).json({ message: "Unauthorized access" });
  } else {
    next();
  }
};
