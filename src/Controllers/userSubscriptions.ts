import express from "express";
import {
  UserSubscriptionModel,
  denySubscriptionRequest,
  acceptSubscriptionRequest,
  requestSubscription,
} from "../Model/subscriptions";

//==================================================Request custom subscription===========================================================
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

//================================================Accept Subscription===========================================================
export const accepttSubscription = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { requestId, userId, creatorId, subscriptionId } = req.body;
    if (!userId || !creatorId || !subscriptionId || requestId) {
      const response = {
        message: "Invalid request. Required data not provided.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const userRequest = await acceptSubscriptionRequest(
      requestId,
      userId,
      creatorId,
      subscriptionId
    );
    if (userRequest) {
      const response = {
        message: "Request accepted.",
        result: { userRequest },
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

//==============================================Deny Subscription==============================================

export const denytSubscription = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { requestId, userId, creatorId, subscriptionId } = req.body;
    if (!userId || !creatorId || !subscriptionId || requestId) {
      const response = {
        message: "Invalid request. Required data not provided.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const userRequest = await denySubscriptionRequest(
      requestId,
      userId,
      creatorId,
      subscriptionId
    );
    if (userRequest) {
      const response = {
        message: "User request denied.",
        result: { userRequest },
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

//=============================================================================================================
