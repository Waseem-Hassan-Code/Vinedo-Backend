import express from "express";
import {
  denySubscriptionRequest,
  acceptSubscriptionRequest,
  requestSubscription,
  getAllAcceptedRequest,
  getAllUserRequests,
  subscriptionsCount,
} from "../Model/subscriptions";
import { customSubscribed, subscribe } from "../Helpers/subscriptionBridge";
import { findCreator } from "../Model/users";

//==================================================Pay Normal Amount===========================================================
export const payNormalAmount = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, creatorId, subscriptionId } = req.body;
    console.log(userId, "user");
    console.log(creatorId, "cre");
    console.log(subscriptionId, "sub");
    if (!userId || !creatorId || !subscriptionId) {
      return res.status(400).json({
        message: "Invalid request. Required data not provided.",
        result: {},
      });
    }

    const makePayment = await subscribe(userId, creatorId, subscriptionId);

    if (makePayment) {
      return res.status(200).json({
        message: "Subscription successful!",
        result: { makePayment },
      });
    } else {
      return res.status(400).json({
        message: "Something went wrong!",
        result: {},
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      result: { error },
    });
  }
};

//==================================================Pay custom Amount===========================================================
export const payCustomAmount = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { requestId, userId, creatorId, subscriptionId } = req.body;
    if (!requestId || !userId || !creatorId || subscriptionId) {
      const response = {
        message: "Invalid request. Required data not provided.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const makePayment = await customSubscribed(
      requestId,
      userId,
      creatorId,
      subscriptionId
    );
    if (makePayment) {
      const response = {
        message: "Request sent to creator.",
        result: { makePayment },
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
//==================================================Request custom subscription===========================================================
export const requestCustomSub = async (
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

//================================================Accept Subscription===============================================
export const accepttSubscription = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userIdentity = req.params.userIdentity;
    const { requestId, userId, creatorId, subscriptionId } = req.body;
    if (!userIdentity) {
      const response = {
        message: "Invalid request. User Not Found.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }

    if (!userId || !creatorId || !subscriptionId || !requestId) {
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
    if (!userId || !creatorId || !subscriptionId || !requestId) {
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

//========================================Accepted requests=====================================================================

export const getAcceptedUserRequests = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      const response = {
        message: "Invalid request. Required data not provided.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const userRequest = await getAllAcceptedRequest(userId);
    if (userRequest) {
      const response = {
        message: "Accepted user requests.",
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

//========================================All user requests=====================================================================

export const getAllUserCustomRequests = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const creatorId = req.params.creatorId;
    if (!creatorId) {
      const response = {
        message: "Invalid request. Required data not provided.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const userRequest = await getAllUserRequests(creatorId);
    if (userRequest) {
      const response = {
        message: "All users requests.",
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

//=============================Search Creator=================================

export const search_Creator = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { name, page = 1, pageSize = 10 } = req.body;
    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    const searching = await findCreator(name, pageNumber, pageSizeNumber);

    if (searching || searching != null) {
      return res.status(200).json({
        message: "Returning Creators.",
        result: searching,
      });
    } else {
      return res.status(404).json({
        message: "No creator found.",
        result: {},
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error.",
      result: {},
    });
  }
};

//==============================Total subscribers==============================

export const subscriptionsTotal = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const creatorId = req.params.creatorId;
    if (!creatorId) {
      return res.status(400).json({
        message: "Creator Id not provided.",
        result: {},
      });
    }

    const countSubscriptions: number = await subscriptionsCount(creatorId);

    if (countSubscriptions) {
      return res.status(200).json({
        message: "Returning number of subscribers.",
        result: countSubscriptions,
      });
    } else {
      return res.status(404).json({
        message: "Currently no subscribers.",
        result: 0,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error.",
      result: {},
      error: error.message,
    });
  }
};
