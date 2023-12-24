import express from "express";
import { VideoModel, getAllVideosPaginated } from "../Model/videos";
import {
  VideoCommentsModel,
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "../Model/videoComments";
import { fileBucket } from "../Helpers/constants";
import { authorizedUser } from "../Helpers/validateUser";
import { likeOrDislikeVideo, likesOnVideo } from "../Model/videoLikes";
import { streamToBuffer } from "../Helpers";
import Hls from "hls.js";

//====================================Get Videos Creator=========================================

export const getVideosThumbNails_Creator = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const creatorId = req.params.creatorId;
    const { page = 1, pageSize = 10 } = req.query;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    // Validate page and pageSize
    if (
      isNaN(pageNumber) ||
      isNaN(pageSizeNumber) ||
      pageNumber <= 0 ||
      pageSizeNumber <= 0
    ) {
      return res.status(400).json({
        message: "Invalid page or pageSize parameters.",
        result: [],
      });
    }

    if (!creatorId) {
      return res.status(404).json({
        message: "Videos not found.",
        result: [],
      });
    }

    const isAuthorized = await authorizedUser(creatorId);

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to access this content.",
        result: [],
      });
    }

    const skip = (pageNumber - 1) * pageSizeNumber;
    const videos = await getAllVideosPaginated(creatorId, skip, pageSizeNumber);

    const formattedVideos = await Promise.all(
      videos.map(async (video) => {
        const videoPath = video.thumbnailName;
        const file = fileBucket.file(videoPath);
        const comments = await getComments(video._id.toString());
        const readStream = file.createReadStream();

        const buffer = await streamToBuffer(readStream);

        return {
          videoId: video._id,
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
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      result: [],
    });
  }
};

//============================================Get-Video-By-Id=============================================

export const getSingleVideo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, creatorId } = req.query;

    if (!videoId || !creatorId) {
      return res.status(400).json({
        message: "Invalid or missing videoId or creatorId parameters.",
        result: {},
      });
    }

    const video = await VideoModel.findOne({
      _id: videoId,
      creatorId: creatorId,
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found.",
        result: {},
      });
    }

    const file = fileBucket.file(video.fileName);
    const comments = await getComments(video._id.toString());
    const readStream = file.createReadStream();
    const buffer = await streamToBuffer(readStream);

    const formattedVideo = {
      videoId: video._id,
      title: video.title,
      comments,
      videoData: buffer.toString("base64"),
    };

    return res.status(200).json({
      message: "Video retrieved successfully.",
      result: formattedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      result: {},
    });
  }
};

//=========================================Post a comment==============================================

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

//=========================================Delete a comment==============================================

export const delete_A_Comment = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, userId, commentId } = req.params;

    if (!commentId || !videoId || !userId) {
      const response = {
        message: "Can not delete a comment.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const result = await deleteComment(videoId, userId, commentId);

    if (result) {
      const response = {
        message: "Deleted a comment.",
        result: { result },
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Failed to delete a comment right now.",
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

//=========================================Update a comment============================================

export const update_A_Comment = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, userId, commentId, newComment } = req.body;

    if (!commentId || !videoId || !userId || !newComment || newComment === "") {
      const response = {
        message: "Can not update a comment.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const result = await updateComment(videoId, userId, commentId, newComment);

    if (result) {
      const response = {
        message: "Deleted a comment.",
        result: { result },
      };
      return res.status(200).json(response);
    } else {
      const response = {
        message: "Failed to delete a comment right now.",
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

//==============================Like or dislike a image================================

export const LikeDislikeVideos = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { imageId, userId } = req.body;

    if (!imageId || !userId) {
      return res.status(400).json({
        message:
          "Cannot like or dislike the post, provide videoId, and userId.",
        result: {},
      });
    }

    const result = await likeOrDislikeVideo(imageId, userId);

    if (result) {
      console.log(`Video liked by ${userId}`);
      return res.status(200).json({
        message: "Video liked.",
        result: { result },
      });
    } else {
      console.log(`Video disliked by ${userId}`);
      return res.status(200).json({
        message: "Video disliked.",
        result: { result },
      });
    }
  } catch (error) {
    console.error(`Error while processing like/dislike: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      result: { error: error.message },
    });
  }
};

//==============================Likes on image================================

export const LikenOnVid = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({
        message: "Cannot counts likes on provide videoId.",
        result: {},
      });
    }

    const result = await likesOnVideo(imageId);

    if (result) {
      console.log(`Video liked by ${imageId}`);
      return res.status(200).json({
        message: "Video total likes.",
        result: { result },
      });
    } else {
      console.log(`Video disliked by ${imageId}`);
      return res.status(400).json({
        message: "could not retrived likes.",
        result: { result },
      });
    }
  } catch (error) {
    console.error(`Error while processing total likes: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      result: { error: error.message },
    });
  }
};
