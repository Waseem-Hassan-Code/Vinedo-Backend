import express from "express";
import {
  updateProfilePicture,
  UserModel,
  deleteProfilePicture,
  updateCoverPicture,
  deleteCoverPicture,
} from "../Model/users";
import { addVideo } from "../Model/videos";
import { fileBucket, fileStorage } from "../Helpers/constants";
import { secretKey } from "../Helpers/secretKeyGnerator";
import { addImage } from "../Model/images";
import { authorizedUser } from "../Helpers/validateUser";
import fs from "fs";
//import { processVideo } from "../Helpers";
import path from "path";
import sharp from "sharp";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
var ffmpeg = require("fluent-ffmpeg");

// ================================upload Profile Picture==================================
export const uploadProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.body;
    console.log(id);
    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const user = await UserModel.findById(id)
      .select("avatar.imageName avatar.imagePath")
      .exec();

    if (user.avatar.imagePath && user.avatar.imagePath !== "") {
      await deleteProfilePicture(id);
    }

    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        status: 400,
        message: "No file uploaded or file URL not found.",
        result: {},
      });
    }

    const compressedBuffer = await sharp(imageFile.buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const timestamp = Date.now();
    const imageName = `${timestamp}_${secretKey}_${imageFile.originalname.replace(
      /\s/g,
      ""
    )}`;
    const blob = fileBucket.file(imageName);

    const blobStream = blob.createWriteStream();
    const imageURL = `${process.env.GOOGLE_STORAGE_BASE_URL}${fileBucket.name}/${imageName}`;

    blobStream.on("finish", async () => {
      try {
        await updateProfilePicture(id, imageName, imageURL);

        const response = {
          message: "Image uploaded successfully.",
          result: {},
        };

        return res.status(200).json(response);
      } catch (error) {
        console.error("Error updating user profile picture:", error);
        return sendInternalError(res);
      }
    });

    blobStream.on("error", (error) => {
      console.error("Error in blobStream:", error);
      return sendInternalError(res);
    });

    blobStream.end(compressedBuffer);
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error);
    return sendInternalError(res);
  }
};

//================================upload cover===================================
export const uploadCoverPicture = async (
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

    const isAuthorized = await authorizedUser(id);
    if (!isAuthorized) {
      const response = {
        message: "You are not authorized to upload a video.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const user = await UserModel.findById(id)
      .select("cover.imageName cover.imagePath")
      .exec();

    if (user.cover.imagePath && user.cover.imagePath !== "") {
      await deleteCoverPicture(id);
    }

    const coverFile = req.file;

    if (!coverFile) {
      return res.status(400).json({
        status: 400,
        message: "No file uploaded or file URL not found.",
        result: {},
      });
    }

    const timestamp = Date.now();
    const imageName = `${timestamp}_${secretKey}_${coverFile.originalname.replace(
      /\s/g,
      ""
    )}`;
    const blob = fileBucket.file(imageName);

    const blobStream = blob.createWriteStream();
    const imageURL = `${process.env.GOOGLE_STORAGE_BASE_URL}${fileBucket.name}/${imageName}`;

    blobStream.on("finish", async () => {
      try {
        await updateCoverPicture(id, imageName, imageURL);

        const response = {
          message: "Image uploaded successfully.",
          result: {},
        };

        return res.status(200).json(response);
      } catch (error) {
        console.error("Error updating user cover picture:", error);
        return sendInternalError(res);
      }
    });

    blobStream.on("error", (error) => {
      console.error("Error in blobStream:", error);
      return sendInternalError(res);
    });

    blobStream.end(coverFile.buffer);
  } catch (error) {
    console.error("Error in uploadCoverPicture:", error);
    return sendInternalError(res);
  }
};

const sendInternalError = (res: express.Response) => {
  return res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    result: {},
  });
};

// ================================upload Video==================================

export const uploadNewVideo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, creatorId } = req.body;
    const videoFile = req.file;

    if (
      !title ||
      !description ||
      !creatorId ||
      !videoFile ||
      !videoFile.originalname
    ) {
      const response = {
        message: "Failed to upload video. Something is missing.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const isAuthorized = await authorizedUser(creatorId);
    if (!isAuthorized) {
      const response = {
        message: "You are not authorized to upload a video.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const timestamp = Date.now();
    const videoName = `${timestamp}_${secretKey}_${videoFile.originalname.replace(
      /\s/g,
      ""
    )}`;
    const tempFilePath = path.join(__dirname, "..", "Temp", videoName);

    const thumbnailName = `${videoName.replace(/\s/g, "")}_thumbnail.png`;

    const tempScreenShotPath = path.join(
      __dirname,
      "..",
      "Temp",
      thumbnailName
    );

    if (!fs.existsSync(path.dirname(tempFilePath))) {
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }

    fs.writeFileSync(tempFilePath, videoFile.buffer);

    ffmpeg.setFfmpegPath(ffmpegPath);

    new ffmpeg(tempFilePath).takeScreenshots(
      {
        filename: "Pic" + Date.now(),
        count: 1,
        timemarks: ["6"],
      },
      tempScreenShotPath
    );

    const blobVideo = fileBucket.file(videoName);
    const blobStreamVideo = blobVideo.createWriteStream();

    const blobStreamThumbnail = fileBucket
      .file(thumbnailName)
      .createWriteStream();

    const videoUrl = `${process.env.GOOGLE_STORAGE_BASE_URL}${fileBucket.name}/${videoName}`;
    const thumbnailUrl = `${process.env.GOOGLE_STORAGE_BASE_URL}${fileBucket.name}/${thumbnailName}`;

    blobStreamVideo.on("finish", async () => {
      try {
        fs.unlinkSync(tempFilePath);
        blobStreamThumbnail.on("finish", async () => {
          try {
            await addVideo({
              title,
              description,
              fileName: videoName,
              url: videoUrl,
              thumbnailName,
              thumbnailUrl,
              postDate: timestamp,
              creatorId,
            });

            const response = {
              message: "Video uploaded successfully.",
              result: {},
            };
            return res.status(200).json(response);
          } catch (error) {
            console.error("Error in thumbnail upload:", error);
            return res.status(500).json({
              status: 500,
              message: "Internal Server Error",
              result: {},
            });
          }
        });

        blobStreamThumbnail.on("error", (error) => {
          console.error("Error in blobStreamThumbnail:", error);
          return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            result: {},
          });
        });

        blobStreamThumbnail.end(() => {
          fs.rmdir(thumbnailName, { recursive: true }, (error) => {
            if (error) {
              console.error("Error deleting folder:", error);
            } else {
              console.log("Folder deleted successfully.");
            }
          });
        });
      } catch (error) {
        console.error("Error in video upload:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
          result: {},
        });
      }
    });

    blobStreamVideo.on("error", (error) => {
      console.error("Error in blobStreamVideo:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error", result: {} });
    });

    blobStreamVideo.end(fs.readFileSync(tempFilePath));
  } catch (error) {
    console.error("Error in uploadNewVideo:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", result: {} });
  }
};

// ================================upload Image==================================

export const uploadNewImage = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { title, description, creatorId } = req.body;
    const imageFile = req.file;

    if (!title || !description || !creatorId || !imageFile) {
      const response = {
        message: "Failed to upload image. Something is missing.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const isAuthorized = await authorizedUser(creatorId);

    if (!isAuthorized) {
      const response = {
        message: "You are not authorized to upload a image.",
        result: {},
      };
      return res.status(403).json(response);
    }

    const timestamp = Date.now();
    const imageName = `${timestamp}_${secretKey}_${imageFile.originalname.replace(
      /\s/g,
      ""
    )}`;
    const blob = fileBucket.file(imageName);

    const blobStream = blob.createWriteStream();

    const videoUrl = `${process.env.GOOGLE_STORAGE_BASE_URL}${fileBucket.name}/${imageName}`;

    blobStream.on("finish", async () => {
      try {
        await addImage({
          title,
          description,
          fileName: imageName,
          url: videoUrl,
          creatorId,
          postDate: timestamp,
        });

        const response = {
          message: "Image uploaded successfully.",
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

    blobStream.end(imageFile.buffer);
  } catch (error) {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };

    return res.status(500).json(response);
  }
};
