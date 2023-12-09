import express from "express";
import { VideoModel, addVideo, getAllVideos } from "../Model/videos";
import {
  VideoCommentsModel,
  addComment,
  deleteComment,
  updateComment,
} from "../Model/videoComments";
import { getUserById } from "../Model/users";
import { fileStorage, fileBucket } from "../Helpers/constants";

//=================================================================================================
export const getAllVideos_Creator = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { creatorId } = req.query;

    if (!creatorId) {
      const response = {
        message: "System can not find any user.",
        result: {},
      };
      return res.status(404).json(response);
    }

    const checkUser = await getUserById(creatorId.toString());

    if (checkUser.isContentCreator === true) {
      const getVids = await getAllVideos(creatorId.toString());

      if (getVids) {
        const videoNames = getVids.map((video) => video.fileName);

        const filesPromises = videoNames.map(async (videoName) => {
          const file = fileBucket.file(videoName);

          return file;
        });

        const files = await Promise.all(filesPromises);

        const response = {
          message: "Files fetched successfully!",
          result: { files },
        };

        return res.status(200).json(response);
      } else {
        const response = {
          message: "You are not authorized for this operation.",
          result: {},
        };

        return res.status(404).json(response);
      }
    }
  } catch (error) {
    const response = {
      message: "Internal Server Error",
      result: { error: error.message },
    };

    return res.status(500).json(response);
  }
};

//=================================================================================================

export const getVideo = async (req: express.Request, res: express.Response) => {
  try {
    const { videoId } = req.query;
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
