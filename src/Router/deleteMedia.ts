import express from "express";
import { authenticateToken } from "../Middleware";
import { removeProfilePicture, removeVideo } from "../Controllers/deleteMedia";

export default (router: express.Router) => {
  router.post("/deleteFile/Avatar", authenticateToken, removeProfilePicture);
  router.post("/deleteFile/Video", authenticateToken, removeVideo);
};
