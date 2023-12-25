import express from "express";
import {
  uploadProfilePicture,
  uploadNewVideo,
  uploadNewImage,
  uploadCoverPicture,
} from "../Controllers/uploadMedia";
import { authenticateToken } from "../Middleware";
import {
  uploadImage,
  uploadProfile,
  uploadVideo,
} from "../Middleware/fileHandling";

export default (router: express.Router) => {
  router.post(
    "/uploadFile/Avatar",
    authenticateToken,
    uploadProfile.single("Avatar"),
    uploadProfilePicture
  );

  router.post(
    "/uploadFile/Video",
    authenticateToken,
    uploadVideo.single("Video"),
    uploadNewVideo
  );

  router.post(
    "/uploadFile/Image",
    authenticateToken,
    uploadImage.single("Image"),
    uploadNewImage
  );

  router.post(
    "/uploadFile/Cover",
    authenticateToken,
    uploadProfile.single("Avatar"),
    uploadCoverPicture
  );
};
