import express from "express";
import { authenticateToken } from "../Middleware";
import {
  LikeDislikeImages,
  LikenOnImg,
  delete_A_Comment,
  getImages_Creator,
  postComment,
  update_A_Comment,
} from "../Controllers/images";
import { getAllComments } from "../Controllers/images";

export default (router: express.Router) => {
  router.post("/image/postComments", authenticateToken, postComment);
  router.get("/image/deleteComments", authenticateToken, delete_A_Comment);
  router.post("/image/updateComments", authenticateToken, update_A_Comment);
  router.get(
    "/image/getImages_Creator/:creatorId",
    authenticateToken,
    getImages_Creator
  );
  router.post("images/getAllComments", authenticateToken, getAllComments);
  router.post("/image/imageLikeDislike", authenticateToken, LikeDislikeImages);
  router.post("/image/imageLikeCount", authenticateToken, LikenOnImg);
};
