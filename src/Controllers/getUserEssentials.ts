import { fileBucket } from "../Helpers/constants";
import { UserModel } from "../Model/users";
import express from "express";
import { creatorSubscriptionModel } from "../Model/creatorSubDetails";
import { UserSubscriptionModel } from "../Model/subscriptions";

//================================================GET PROFILE==================================================
export const getProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const user = await UserModel.findById(id)
      .select("avatar.imageName avatar.imagePath")
      .exec();

    if (!user || !user.avatar || !user.avatar.imageName) {
      return res.status(404).json({
        status: 404,
        message: "User or user avatar not found.",
        result: {},
      });
    }

    const file = fileBucket.file(user.avatar.imageName.trim());
    const readStream = file.createReadStream();

    readStream.pipe(res);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};
//=====================================GET COVER=====================================
export const getCoverPicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const user = await UserModel.findById(id)
      .select("cover.imageName cover.imagePath")
      .exec();

    if (!user || !user.cover || !user.cover.imageName) {
      return res.status(404).json({
        status: 404,
        message: "User or user cover not found.",
        result: {},
      });
    }

    const file = fileBucket.file(user.cover.imageName.trim());
    const readStream = file.createReadStream();

    readStream.pipe(res);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};

//=====================================GET SUBSCRIPTION DETAILS===================================

export const getSubscriptionDetail = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const user = await creatorSubscriptionModel
      .findOne({ creatorId: id })
      .select("_id subscriptionPrice payPalEmail")
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Creator Subscription details not found.",
        result: {},
      });
    } else if (user.payPalEmail || user.subscriptionPrice) {
      return res.status(200).json({
        message: "Creator Subscription Details Retrived",
        result: { user },
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};

//=====================================Validate Subscription===================================

export const subscriptionValidity = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, creatorId, subscriptionId } = req.body;

    if (!userId || !creatorId || !subscriptionId) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const sub = await UserSubscriptionModel.findOne({
      userId: userId,
      creatorId: creatorId,
      subscriptionId: subscriptionId,
    })
      .select("isSubscribed isPayable expiryDate")
      .lean()
      .exec();

    if (!sub) {
      return res.status(404).json({
        status: 404,
        message: "User Subscription details not found.",
        result: {},
      });
    } else if (
      sub.isPayable === false &&
      sub.isSubscribed === true &&
      sub.expiryDate
    ) {
      const today: Date = new Date();

      if (sub.expiryDate >= today) {
        return res.status(200).json({
          message: "User is Authorized to watch",
          result: {},
        });
      } else {
        const deleteSubscription = UserSubscriptionModel.deleteOne({
          userId: userId,
          creatorId: creatorId,
          subscriptionId: subscriptionId,
        });
        if ((await deleteSubscription).deletedCount > 0) {
          return res.status(403).json({
            message: "Renew your subscription",
            result: {},
          });
        }
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: "User is not authorized to watch",
        result: {},
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};
