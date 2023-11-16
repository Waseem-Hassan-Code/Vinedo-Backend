import express from "express";
import { VideoModel, addVideo } from "../Model/videos";
import { VideoCommentsModel, addComment } from "../Model/videoComments";
import { getUserById } from "../Model/users";

export const getVideo = async (req: express.Request, res: express.Response) => {
  try {
    const { videoId } = req.query;
    console.log(videoId);
    const video = await VideoModel.findById(videoId).populate("creatorId");
    console.log(video);
    if (!video) {
      const response = {
        message: "Video not found.",
        result: {},
      };
      return res.status(404).json(response);
    }

    const comments = await VideoCommentsModel.find({
      videoId: videoId,
    }).populate("userId");

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

    console.log(comments);

    const response = {
      message: "Video retrieved.",
      result: { result },
    };

    return res.status(200).json(response);
  } catch (error) {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: { error },
    };
    return res.status(500).json(response);
  }
};

//------------------------------------Post a Comment-----------------------------------------
export const postComment = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userComment, videoId, userId } = req.body;

    if (!userComment || !videoId || !userId) {
      const response = {
        message:
          "Cannot post an empty comment. Please provide userComment, videoId, and userId.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const result = await addComment({ comment: userComment, videoId, userId });

    if (result) {
      const response = {
        message: "Posted comment.",
        result: { result },
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Failed to post a comment right now.",
        result: { result },
      };
      return res.status(500).json(response);
    }
  } catch (error) {
    const response = {
      message: "Internal Server Error",
      result: { error: error.message },
    };
    return res.status(500).json(response);
  }
};
