import express from "express";

import {
  forgetPassword,
  login,
  register,
  updatePassword,
  uploadProfilePicture,
} from "../Controllers/authentication";
import { authenticateToken } from "../Middleware";
import { uploadProfile } from "../Middleware/fileHandling";

export default (router: express.Router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post("/auth/forgetPassword", forgetPassword);
  router.post("/auth/updatePassword", updatePassword);
  router.post(
    "/auth/upload-profile",
    authenticateToken,
    uploadProfile.single("avatar"),
    uploadProfilePicture
  );
};
