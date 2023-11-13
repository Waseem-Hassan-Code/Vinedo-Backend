import express from "express";
import authentication from "./authentication";
import uploadMedia from "./uploadMedia";
import deleteMedia from "./deleteMedia";
const router = express.Router();

export default (): express.Router => {
  authentication(router);
  uploadMedia(router);
  deleteMedia(router);

  return router;
};
