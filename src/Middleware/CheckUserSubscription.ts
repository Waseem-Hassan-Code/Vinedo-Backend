import { Request, Response, NextFunction } from "express";
import { getSubscriptionDetails } from "../Model/subscriptions";

interface CustomRequest extends Request {
  user: any;
}

export const isSubscriber = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const uid = req.body.userId || req.query.userId || req.params.userId;
  const cid = req.body.creatorId || req.query.creatorId || req.params.creatorId;
  const sid =
    req.body.subscriptionId ||
    req.query.subscriptionId ||
    req.params.subscriptionId;

  const validate = await getSubscriptionDetails(uid, cid, sid);

  if (validate === null || validate === undefined) {
    return res.status(404).json({ message: "Subscription not found" });
  }
  next();
};
