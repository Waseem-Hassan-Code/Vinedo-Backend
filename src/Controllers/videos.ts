import express from "express";
import { VideoModel, addVideo } from "../Model/videos";
import { VideoCommentsModel } from "../Model/videoComments";

export const getVideo = async (req: express.Request, res: express.Response) => {
  try {
    const { videoId } = req.body;
    const video = await VideoModel.findById(videoId).populate("creatorId");

    if (!video) {
      const response = {
        message: "Video not found.",
        result: {},
      };
      return res.sendStatus(400).json(response);
    }
    const comments = await VideoCommentsModel.find({ videoId }).populate(
      "userId"
    );
    const result = {
      title: video.title,
      description: video.description,
      url: video.url,
      creator: video.creatorId,
      views: video.views,
      likes: video.likes,
      comments: comments.map((comment) => ({
        comment: comment.comment,
        user: comment.userId,
      })),
    };

    if (result) {
      const response = {
        message: "Video retrived.",
        result: { result },
      };
      return res.sendStatus(200).json(response);
    }
  } catch (error) {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: { error },
    };
    return res.status(500).json(response);
  }
};
