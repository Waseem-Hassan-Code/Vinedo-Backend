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

//=================================================================================================

export const getVideos_Creator = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const creatorId = req.params.creatorId;
    const { page = 1, pageSize = 10 } = req.query;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (!creatorId) {
      return res.status(404).json({
        message: "Video not found.",
        result: {},
      });
    }

    const isAuthorized = await authorizedUser(creatorId);

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to access this content.",
        result: {},
      });
    }

    const skip = (pageNumber - 1) * pageSizeNumber;
    const videos = await getAllVideosPaginated(
      creatorId,
      skip,
      <number>pageSize
    );

    if (videos && videos.length > 0) {
      for (const video of videos) {
        const videoPath = video.fileName;
        const file = fileBucket.file(videoPath);
        const comments = await getComments(video._id.toString());
        const readStream = file.createReadStream();

        res.write(`Processing video: ${video.title}\n\nComments:\n`);
        comments.forEach((comment) => {
          res.write(`${comment}\n`);
        });

        readStream.pipe(res, { end: false });
      }
      res.end();
    } else {
      return res.status(404).json({
        message: "No videos found for the specified creator.",
        result: {},
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
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
