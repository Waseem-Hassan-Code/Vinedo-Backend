import express from "express";
import {
  checkUserSubscription,
  getUserSubscriptions,
} from "../Model/subscriptions";
import { VideoModel, getAllVideosPaginated } from "../Model/videos";
import { fileBucket } from "../Helpers/constants";
import { getComments } from "../Model/videoComments";
import { getAllImagesPaginated } from "../Model/images";
import { getCommentsImg } from "../Model/imageComments";
import { streamToBuffer } from "../Helpers";

export const getVideos_User = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, creatorId, page = 1, pageSize = 10 } = req.body;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (!userId || !creatorId) {
      return res.status(404).json({
        message: "User not found.",
        result: [],
      });
    }

    const subscription = await checkUserSubscription(userId, creatorId);

    if (!subscription) {
      return res.status(401).json({
        message: "You are not currently subscribed to this creator.",
        result: [],
      });
    } else if (subscription) {
      const skip = (pageNumber - 1) * pageSizeNumber;
      const videos = await getAllVideosPaginated(
        creatorId,
        skip,
        pageSizeNumber
      );

      const formattedVideos = await Promise.all(
        videos.map(async (video) => {
          const videoPath = video.fileName;
          const file = fileBucket.file(videoPath);
          const comments = await getComments(video._id.toString());
          const readStream = file.createReadStream();

          const buffer = await streamToBuffer(readStream);

          return {
            id: video._id,
            title: video.title,
            comments,
            videoData: buffer.toString("base64"),
          };
        })
      );

      return res.status(200).json({
        message: "Videos retrieved successfully.",
        result: formattedVideos,
      });
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: [],
    });
  }
};

//=======================================================================================================

export const getImages_User = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userId = req.params.userId;
    const creatorId = req.params.creatorId;
    const { page = 1, pageSize = 10 } = req.query;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (!userId || !creatorId) {
      return res.status(404).json({
        message: "User not found.",
        result: [],
      });
    }

    const subscription = await checkUserSubscription(userId, creatorId);

    if (!subscription) {
      return res.status(404).json({
        message: "You are not currently subscribed to this creator.",
        result: [],
      });
    } else if (subscription) {
      const skip = (pageNumber - 1) * pageSizeNumber;
      const images = await getAllImagesPaginated(
        creatorId,
        skip,
        pageSizeNumber
      );

      const formattedImages = await Promise.all(
        images.map(async (image) => {
          const imagePath = image.fileName;
          const file = fileBucket.file(imagePath);
          const comments = await getCommentsImg(image._id.toString());
          const readStream = file.createReadStream();

          const buffer = await streamToBuffer(readStream);

          return {
            id: image._id,
            title: image.title,
            comments,
            imageData: buffer.toString("base64"),
          };
        })
      );

      return res.status(200).json({
        message: "Images retrieved successfully.",
        result: formattedImages,
      });
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: [],
    });
  }
};
