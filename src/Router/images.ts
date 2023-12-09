import express from "express";
import { authenticateToken } from "../Middleware";
import {
  delete_A_Comment,
  postComment,
  update_A_Comment,
} from "../Controllers/images";

export default (router: express.Router) => {
  router.post("/image/postComments", authenticateToken, postComment);
  router.get("/image/deleteComments", authenticateToken, delete_A_Comment);
  router.post("/image/updateComments", authenticateToken, update_A_Comment);
};
