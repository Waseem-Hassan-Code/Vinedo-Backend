import express from "express";
import { authenticateToken } from "../Middleware";
import { getVideo, postComment } from "../Controllers/videos";

export default (router: express.Router) => {
  router.get("/video/getVideo", authenticateToken, getVideo);
  router.post("/video/addComments", authenticateToken, postComment);
};
