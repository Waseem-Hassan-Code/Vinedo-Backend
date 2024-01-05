import express from "express";
import { findVideo, getAllVideosPaginated } from "../Model/videos";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../Model/videoComments";
import { fileBucket } from "../Helpers/constants";
import { likeOrDislikeVideo, likesOnVideo } from "../Model/videoLikes";
import { commentsAggregate } from "../Model/Lookups/VideoComments";
import { parseRange } from "../Helpers/ParseStreamRange";
import { authorizedUser } from "../Helpers/validateUser";
import { streamToBuffer } from "../Helpers";
import io from "../Socket/index";

//====================================Get Videos Creator=========================================

export const getVideosThumbNails_Creator_ = async (
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

    const video = await findVideo(videoId.toString(), creatorId.toString());

    if (!video) {
      return res.status(404).json({
        message: "Video not found.",
        result: {},
      });
    }

    const file = fileBucket.file(video.fileName);

    const metadata = await file.getMetadata();
    const fileSize = metadata[0].size;

    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const rangeRequest = parseRange(<number>fileSize, rangeHeader);
      res.status(206);
      res.set({
        "Content-Range": `bytes ${rangeRequest[0].start}-${rangeRequest[0].end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": rangeRequest[0].end - rangeRequest[0].start + 1,
        "Content-Type": "video/mp4",
      });

      file
        .createReadStream({
          start: rangeRequest[0].start,
          end: rangeRequest[0].end,
        })
        .pipe(res);
    } else {
      res.set({
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      file.createReadStream().pipe(res);
    }

    res.write(
      JSON.stringify({
        videoId: video._id,
        title: video.title,
        description: video.description,
      })
    );
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: {},
    });
  }
};
//=========================================THUMBNAILS API==============================================

export const getVideosThumbNails_Creator = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { creatorId, page = 1, pageSize = 10 } = req.body;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (
      isNaN(pageNumber) ||
      isNaN(pageSizeNumber) ||
      pageNumber <= 0 ||
      pageSizeNumber <= 0 ||
      !creatorId
    ) {
      return res.status(400).json({
        message: "Invalid or missing parameters.",
        result: [],
      });
    }

    const isAuthorized = await authorizedUser(creatorId.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to access this content.",
        result: [],
      });
    }

    const skip = (pageNumber - 1) * pageSizeNumber;
    const videos = await getAllVideosPaginated(creatorId, skip, pageSizeNumber);

    for (const video of videos) {
      try {
        const imagePath = video.fileName;
        const file = fileBucket.file(imagePath);
        const readStream = file.createReadStream();

        io.emit("thumbnailData", {
          videoId: video._id,
          title: video.title,
          description: video.description,
          readStream,
        });
      } catch (streamError) {
        console.error("Error creating readable stream:", streamError);
      }
    }

    return res.status(200).json({
      message: "Thumbnails streaming successfully.",
      result: { count: videos.length },
    });
  } catch (error) {
    console.error("Error retrieving videos:", error);
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

    const video = await findVideo(videoId.toString(), creatorId.toString());

    if (!video) {
      return res.status(404).json({
        message: "Video not found.",
        result: {},
      });
    }

    const file = fileBucket.file(video.fileName);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");

    const readStream = file.createReadStream();

    res.write(
      JSON.stringify({
        videoId: video._id,
        title: video.title,
        description: video.description,
      })
    );

    readStream.on("open", () => {
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
          ? parseInt(parts[1], 10)
          : (typeof file.metadata.size === "number" ? file.metadata.size : -1) -
            1;

        const chunkSize = end - start + 1;
        console.log(chunkSize);

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${file.metadata.size}`,
          "Content-Length": chunkSize,
        });

        readStream.pipe(res, { end: false });
      } else {
        res.setHeader("Content-Length", file.metadata.size);
        readStream.pipe(res);
      }
    });

    res.write("\n");

    readStream.on("error", (error) => {
      console.error("Error streaming video:", error);
      res.status(500).end();
    });
  } catch (error) {
    console.error("Error:", error);
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
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        message: "Cannot counts likes on provide videoId.",
        result: {},
      });
    }

    const result = await likesOnVideo(videoId);

    if (result) {
      console.log(`Video liked by ${videoId}`);
      return res.status(200).json({
        message: "Video total likes.",
        result: { result },
      });
    } else {
      console.log(`Video disliked by ${videoId}`);
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
//====================================Get Video Comments============================================

export const getAllComments = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, page, pageSize } = req.body;

    if (!videoId) {
      return res.status(400).json({
        message: "VideoId not provided.",
        result: {},
      });
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 10;

    const result = await commentsAggregate(
      videoId.toString(),
      parsedPage,
      parsedPageSize
    );

    if (result) {
      return res.status(200).json({
        status: "success",
        message: "Video comments loaded successfully.",
        data: { comments: result },
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: { error: error.message },
    });
  }
};
