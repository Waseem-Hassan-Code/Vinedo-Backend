import express from "express";
import { isValidUser } from "../Middleware/validateUser";
import { authenticateToken } from "../Middleware";
import {
  getImages_User,
  getVideoStream_User,
  getVideosThumbnails_User,
} from "../Controllers/ViewAuthorizedContent";
import { setCreatorSub } from "../Controllers/handleSubscriptionDetailss";
import { isSubscriber } from "../Middleware/CheckUserSubscription";

export default (router: express.Router) => {
  router.post(
    "/content/getVideosThumbnails_User",
    authenticateToken,
    isValidUser,
    isSubscriber,
    getVideosThumbnails_User
  );

  router.post(
    "/content/getVideoStream_User",
    authenticateToken,
    isValidUser,
    isSubscriber,
    getVideoStream_User
  );

  router.post(
    "/content/getImages_User",
    authenticateToken,
    isValidUser,
    isSubscriber,
    getImages_User
  );

  router.post(
    "/creator/setSubscriptionDetails",
    authenticateToken,
    setCreatorSub
  );
};
