import express from "express";
import authentication from "./authentication";
import uploadMedia from "./uploadMedia";
import deleteMedia from "./deleteMedia";
import video from "./video";
import images from "./images";
import userSubscriptions from "./userSubscriptions";
import userAuthorizedContent from "./userAuthorizedContent";
import getEssentials from "./getEssentials";
const router = express.Router();

export default (): express.Router => {
  authentication(router);
  uploadMedia(router);
  deleteMedia(router);
  video(router);
  images(router);
  userSubscriptions(router);
  userAuthorizedContent(router);
  getEssentials(router);

  return router;
};
