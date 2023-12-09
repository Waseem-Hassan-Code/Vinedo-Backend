import express, { response } from "express";
import { deleteFile } from "../Helpers";
import { UserModel, updateProfilePicture } from "../Model/users";
import { VideoModel } from "../Model/videos";
import { fileStorage, fileBucket } from "../Helpers/constants";
import { ImageModel, deleteImage } from "../Model/images";
import { authorizedUser } from "../Helpers/validateUser";

//---------------------------Delete profile picture--------------------------------

export const removeProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const user = await UserModel.findById(id).select("avatar.imageName").exec();

    if (user.avatar.imageName) {
      await deleteFileFromGoogleStorage(user.avatar.imageName);
      await updateProfilePicture(id, "", "");

      return res.status(200).json({
        status: 200,
        message: "Avatar removed successfully!",
        result: {},
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Profile picture not found.",
        result: {},
      });
    }
  } catch (error) {
    console.error("Error removing profile picture:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};

const deleteFileFromGoogleStorage = async (fileName: string) => {
  const blob = fileBucket.file(fileName);
  await blob.delete();
};

//---------------------------Delete a video--------------------------------

export const deleteVideo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, creatorId } = req.body;

    if (!videoId || !creatorId) {
      const response = {
        message: "Invalid input. Both videoId and creatorId are required.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const isAuthorized = await authorizedUser(creatorId);

    if (isAuthorized) {
      const response = {
        message: "You are not authorized to delete this video.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const video = await VideoModel.findById(videoId);
    if (!video) {
      const response = {
        message: "Video not found.",
        result: {},
      };
      return res.status(404).json(response);
    }

    const videoName = video.fileName;
    const blob = fileBucket.file(videoName);
    await blob.delete();

    const deletedVideo = await VideoModel.findOneAndDelete({
      _id: videoId,
      creatorId,
    });

    if (deletedVideo) {
      const response = {
        message: "Video deleted successfully.",
        result: deletedVideo,
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Failed to delete video from the database.",
        result: {},
      };
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error deleting video:", error);
    const response = {
      message: "Internal server error.",
      result: {},
    };
    return res.status(500).json(response);
  }
};

//---------------------------Delete an Image--------------------------------
export const deleteImages = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { ImageId, creatorId } = req.body;

    if (!ImageId || !creatorId) {
      const response = {
        message: "Invalid input. Both ImageId and creatorId are required.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const isAuthorized = await authorizedUser(creatorId);

    if (isAuthorized) {
      const response = {
        message: "You are not authorized to delete this image.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const image = await ImageModel.findById(ImageId);
    if (!image) {
      const response = {
        message: "Image not found.",
        result: {},
      };
      return res.status(404).json(response);
    }

    const imageName = image.fileName;
    const blob = fileBucket.file(imageName);
    await blob.delete();

    const deletedImage = await ImageModel.findOneAndDelete({
      _id: ImageId,
      creatorId,
    });

    if (deletedImage) {
      const response = {
        message: "Image deleted successfully.",
        result: deletedImage,
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Failed to delete Image from the database.",
        result: {},
      };
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error deleting Image:", error);
    const response = {
      message: "Internal server error.",
      result: {},
    };
    return res.status(500).json(response);
  }
};
