import express, { response } from "express";
import { deleteFile } from "../Helpers";
import { UserModel, deleteProfilePicture } from "../Model/users";
import { VideoModel } from "../Model/videos";
import { VideoCommentsModel } from "../Model/videoComments";
import { getUserById } from "../Model/users";

//---------------------------Delete profile picture--------------------------------
export const removeProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
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
    if (user.avatar.localPath) {
      deleteFile(user.avatar.localPath);
      const profileURL = await deleteProfilePicture(id);
      if (profileURL) {
        const response = {
          status: 200,
          message: "Avatar removed successfully!",
          result: {},
        };
        return res.status(200).json(response);
      }
      const response = {
        status: 200,
        message: "Avatar removed successfully!",
        result: {},
      };
      return res.status(200).json(response);
    } else {
      const response = {
        status: 400,
        message: "Try again later!",
        result: {},
      };
      return res.status(400).json(response);
    }
  } catch {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };
    return res.status(500).json(response);
  }
};

//---------------------------Delete a video--------------------------------

export const removeVideo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, creatorId } = req.body;
    if (!videoId || !creatorId) {
      const response = {
        status: 400,
        message: "Invalid request. 'videoId' & 'creatorId' is required.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const checkCreator = await getUserById(creatorId);
    if (checkCreator.isContentCreator === false) {
      const response = {
        message: "You are not authorized to upload a video.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const videoUrl = await VideoModel.findById(videoId).select("url").exec();

    deleteFile(videoUrl.url);
    const deleted = VideoModel.deleteOne({
      _id: videoId,
      creatorId: creatorId,
    });

    if (videoUrl && (await deleted).deletedCount >= 1) {
      await VideoCommentsModel.deleteMany({ videoId: videoId });

      const response = {
        status: 200,
        message: "Video removed successfully!",
        result: {},
      };
      return res.status(200).json(response);
    } else {
      const response = {
        status: 400,
        message: "Try again later!",
        result: {},
      };
      return res.status(400).json(response);
    }
  } catch {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };
    return res.status(500).json(response);
  }
};
