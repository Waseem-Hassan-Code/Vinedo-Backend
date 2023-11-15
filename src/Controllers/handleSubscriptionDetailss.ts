import express from "express";
import mongoose from "mongoose";
import {
  setCreatorSubscriptionDetails,
  getCreatorSubscriptionDetails,
  upDateSubscriptionDetails,
} from "../Model/creatorSubDetails";

export const setCreatorSub = async (
  req: express.Request,
  res: express.Response
) => {
  const { creatoId, subscriptionPrice } = req.body();
  try {
    if (!creatoId || !subscriptionPrice) {
      const response = {
        message: "Invalid request. 'creatorId' is required.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const setSubscription = await setCreatorSubscriptionDetails({
      creatoId,
      subscriptionPrice,
    });
    if (setSubscription) {
      const response = {
        message: "Data updated!",
        result: { setSubscription },
      };
      return res.sendStatus(200).json(response);
    } else {
      const response = {
        message: "Data updation failed!",
        result: { setSubscription },
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
//----------------------------------------------------------------------
export const getCreatorSub = async (
  req: express.Request,
  res: express.Response
) => {
  const { creatoId } = req.body;
  try {
    if (!creatoId) {
      const response = {
        message: "Invalid request. 'creatorId' is required.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const detail = await getCreatorSubscriptionDetails(creatoId);
    if (detail) {
      const response = {
        message: "Creator subscription details!",
        result: { detail },
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
//----------------------------------------------------------------------

export const updateCreatorSub = async (
  req: express.Request,
  res: express.Response
) => {
  const { creatoId, subscriptionPrice } = req.body;
  try {
    if (!creatoId || !subscriptionPrice) {
      const response = {
        message: "Invalid request. 'creatorId' and 'updatedPrice' is required.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const newPrice = await upDateSubscriptionDetails(
      creatoId,
      subscriptionPrice
    );
    if (newPrice) {
      const response = {
        message: "Creator subscription updated!",
        result: { newPrice },
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
