import express from "express";
import {
  uploadProfilePicture,
  uploadNewVideo,
} from "../Controllers/uploadMedia";
import { authenticateToken } from "../Middleware";
import { uploadProfile, uploadVideo } from "../Middleware/fileHandling";

export default (router: express.Router) => {
  router.post(
    "/uploadFile/Avatar",
    authenticateToken,
    uploadProfile.single("Avatar"),
    uploadProfilePicture
  );

  router.post(
    "/uploadFile/Avatar",
    authenticateToken,
    uploadVideo.single("Video"),
    uploadNewVideo
  );
};
