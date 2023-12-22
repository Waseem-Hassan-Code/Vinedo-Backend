import express from "express";
import { isValidUser } from "../Middleware/validateUser";
import { authenticateToken } from "../Middleware";
import {
  getImages_User,
  getVideos_User,
} from "../Controllers/ViewAuthorizedContent";
import { setCreatorSub } from "../Controllers/handleSubscriptionDetailss";

export default (router: express.Router) => {
  router.post(
    "/content/getVideos/:userId/:creatoId",
    authenticateToken,
    isValidUser,
    getVideos_User
  );
  router.post(
    "/content/getImages/:userId/:creatoId",
    authenticateToken,
    isValidUser,
    getImages_User
  );

  router.post(
    "/creator/setSubscriptionDetails",
    authenticateToken,
    setCreatorSub
  );
};
