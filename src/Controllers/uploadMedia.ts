import express from "express";
import mongoose from "mongoose";
import {
  addProfilePicture,
  UserModel,
  deleteProfilePicture,
} from "../Model/users";
import { deleteFile } from "../Helpers";
import { addVideo } from "../Model/videos";

export const uploadProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.body;

    if (!id) {
      const response = {
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      };
      return res.status(400).json(response);
    }
    const user = await UserModel.findById(id).select("avatar.localPath").exec();
    if (user.avatar.localPath || user.avatar.localPath != "") {
      deleteFile(user.avatar.localPath);
      const profileURL = await deleteProfilePicture(id);
    }

    const imageURL = req.file?.path;

    if (!imageURL) {
      const response = {
        status: 400,
        message: "No file uploaded or file URL not found.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const upload = await addProfilePicture(id, imageURL);
    if (upload) {
      const response = {
        status: 200,
        message: "Profile Picture Updated!",
        result: {},
      };
      return res.json(response);
    } else {
      deleteFile(imageURL);
      const response = {
        status: 400,
        message: "We couldn't update your picture at the moment!",
        result: {},
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };
    return res.status(500).json(response);
  }
};

// ------------------------------upload Video------------------------------------------------
export const uploadNewVideo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, creatorId } = req.body;
    if (!title || !description || !creatorId) {
      const response = {
        message: "Failed to upload video.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const videoUrl = req.file?.path;

    if (!videoUrl) {
      const response = {
        message: "No file uploaded or file URL not found.",
        result: {},
      };
      return res.status(400).json(response);
    }
    const video = await addVideo({
      title,
      description,
      url: videoUrl,
      creatorId,
    });
    if (video) {
      const response = {
        message: "Video uploaded sucessfully.",
        result: { video },
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Upload failed.",
        result: {},
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };
    return res.status(500).json(response);
  }
};
