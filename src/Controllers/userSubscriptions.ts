import express from "express";
import {
  UserSubscriptionModel,
  requestSubscription,
} from "../Model/subscriptions";

export const requestSub = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, creatoId, subscriptionId, userQuotation, isRequested } =
      req.body;
    if (!userId || !creatoId || !subscriptionId || isRequested) {
      const response = {
        message: "Invalid request. Required data not provided.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const reqSubscription = await requestSubscription({
      userId,
      creatoId,
      subscriptionId,
      userQuotation,
      isRequested: true,
    });
    if (reqSubscription) {
      const response = {
        message: "Request sent to creator.",
        result: { reqSubscription },
      };
      return res.sendStatus(200).json(response);
    } else {
      const response = {
        message: "Something went wrong!",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
  } catch (error) {
    const response = {
      message: "Internal server error!",
      result: { error },
    };
    return res.sendStatus(500).json(response);
  }
};
