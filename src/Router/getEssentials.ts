import express from "express";
import { authenticateToken } from "../Middleware";
import {
  getCoverPicture,
  getProfilePicture,
  getSubscriptionDetail,
} from "../Controllers/getUserEssentials";

export default (router: express.Router) => {
  router.get("/userEssentials/getProfile", getProfilePicture);
  router.get("/userEssentials/getCover", getCoverPicture);
  router.get("/userEssentials/accountDetails", getSubscriptionDetail);
};
