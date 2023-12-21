import express from "express";
import { authenticateToken } from "../Middleware";
import {
  delete_A_Comment,
  getVideo,
  getVideos_Creator,
  postComment,
  update_A_Comment,
} from "../Controllers/videos";

export default (router: express.Router) => {
  router.get(
    "/video/getVideo_Creator/:creatorId",
    authenticateToken,
    getVideos_Creator
  );
  router.get("/video/getVideo", authenticateToken, getVideo);
  router.post("/video/postComments", authenticateToken, postComment);
  router.get("/video/deleteComments", authenticateToken, delete_A_Comment);
  router.post("/video/updateComments", authenticateToken, update_A_Comment);
};
