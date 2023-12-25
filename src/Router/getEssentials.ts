import express from "express";
import { authenticateToken } from "../Middleware";
import {
  getCoverPicture,
  getProfilePicture,
} from "../Controllers/getUserEssentials";

export default (router: express.Router) => {
  router.post(
    "/userEssentials/getProfile",
    authenticateToken,
    getProfilePicture
  );
  router.post("/userEssentials/getCover", authenticateToken, getCoverPicture);
};
