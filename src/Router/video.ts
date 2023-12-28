import express from "express";
import { authenticateToken } from "../Middleware";
import {
  LikeDislikeVideos,
  LikenOnVid,
  delete_A_Comment,
  getAllComments,
  getSingleVideo,
  getVideosThumbNails_Creator,
  postComment,
  update_A_Comment,
} from "../Controllers/videos";

export default (router: express.Router) => {
  router.post(
    "/video/getVideoThumbnails_Creator",
    authenticateToken,
    getVideosThumbNails_Creator
  );
  router.get("/video/getSingleVideo", authenticateToken, getSingleVideo);
  router.post("/video/getVideoComments", authenticateToken, getAllComments);
  router.post("/video/postComments", authenticateToken, postComment);
  router.get("/video/deleteComments", authenticateToken, delete_A_Comment);
  router.post("/video/updateComments", authenticateToken, update_A_Comment);
  router.post("/video/videoLikeDislike", authenticateToken, LikeDislikeVideos);
  router.post("/video/videoLikeCount", authenticateToken, LikenOnVid);
};
