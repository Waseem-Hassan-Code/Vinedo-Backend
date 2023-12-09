import express from "express";
import mongoose from "mongoose";
import {
  addProfilePicture,
  UserModel,
  deleteProfilePicture,
} from "../Model/users";
import { deleteFile } from "../Helpers";
import { addVideo } from "../Model/videos";
import { getUserById } from "../Model/users";
import { fileBucket, fileStorage } from "../Helpers/constants";
import { secretKey } from "../Helpers/secretKeyGnerator";

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

// ================================upload Video==================================

export const uploadNewVideo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, creatorId } = req.body;
    const videoFile = req.file;

    if (!title || !description || !creatorId || !videoFile) {
      const response = {
        message: "Failed to upload video. Something is missing.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const checkCreator = await getUserById(creatorId);

    if (!checkCreator || !checkCreator.isContentCreator) {
      const response = {
        message: "You are not authorized to upload a video.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const timestamp = Date.now();
    const videoName = `${timestamp}_${secretKey}_${videoFile.originalname}`;
    const blob = fileBucket.file(videoName);

    const blobStream = blob.createWriteStream();

    const videoUrl = `${process.env.GOOGLE_STORAGE_BASE_URL}${fileBucket.name}/${videoName}`;
    console.log("Video Name:", videoName);
    console.log("Video URL:", videoUrl);

    blobStream.on("finish", async () => {
      try {
        await addVideo({
          title,
          description,
          fileName: videoName,
          url: videoUrl,
          creatorId,
          postDate: timestamp,
        });

        const response = {
          message: "Video uploaded successfully.",
          result: {},
        };

        return res.status(200).json(response);
      } catch (error) {
        const response = {
          status: 500,
          message: "Internal Server Error",
          result: {},
        };

        return res.status(500).json(response);
      }
    });

    blobStream.on("error", (error) => {
      console.error("Error in blobStream:", error);

      const response = {
        status: 500,
        message: "Internal Server Error",
        result: {},
      };

      return res.status(500).json(response);
    });

    blobStream.end(videoFile.buffer);
  } catch (error) {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };

    return res.status(500).json(response);
  }
};
