import express from "express";
import authentication from "./authentication";
import uploadMedia from "./uploadMedia";
import deleteMedia from "./deleteMedia";
import video from "./video";
import images from "./images";
import userSubscriptions from "./userSubscriptions";
import userAuthorizedContent from "./userAuthorizedContent";
const router = express.Router();

export default (): express.Router => {
  authentication(router);
  uploadMedia(router);
  deleteMedia(router);
  video(router);
  images(router);
  userSubscriptions(router);
  userAuthorizedContent(router);

  return router;
};
