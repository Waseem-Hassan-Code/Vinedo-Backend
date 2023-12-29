import express from "express";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../Model/imageComments";
import { authorizedUser } from "../Helpers/validateUser";
import { getAllImagesPaginated } from "../Model/images";
import { fileBucket, fileStorage } from "../Helpers/constants";
import { getComments } from "../Model/videoComments";
import { likeOrDislikeImage, likesOnImage } from "../Model/ImageLikes";
import { streamToBuffer } from "../Helpers";
import { commentsAggregate } from "../Model/Lookups/ImageComments";

//===============================================Get all images========================================

export const getImages_Creator = async (
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
        message: "Images not found.",
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
    const images = await getAllImagesPaginated(creatorId, skip, pageSizeNumber);

    const formattedImages = await Promise.all(
      images.map(async (image) => {
        const imagePath = image.fileName;
        const comments = await getComments(image._id.toString());
        const file = fileBucket.file(imagePath);
        const readStream = file.createReadStream();

        const buffer = await streamToBuffer(readStream);

        return {
          imageId: image._id,
          title: image.title,
          description: image.description,
          comments,
          imageData: buffer.toString("base64"),
        };
      })
    );

    return res.status(200).json({
      message: "Images retrieved successfully.",
      result: formattedImages,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: [],
    });
  }
};

//=========================================Post a comment==============================================

export const postComment = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userComment, imageId, userId } = req.body;

    if (!userComment || !imageId || !userId) {
      const response = {
        message:
          "Cannot post an empty comment. Please provide userComment, imageId, and userId.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const result = await addComment({ comment: userComment, imageId, userId });

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
    const { imageId, userId, commentId } = req.params;

    if (!commentId || !imageId || !userId) {
      const response = {
        message: "Can not delete a comment.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const result = await deleteComment(imageId, userId, commentId);

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
    const { imageId, userId, commentId, newComment } = req.body;

    if (!commentId || !imageId || !userId || !newComment || newComment === "") {
      const response = {
        message: "Can not update a comment.",
        result: {},
      };
      return res.status(400).json(response);
    }

    const result = await updateComment(imageId, userId, commentId, newComment);

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

export const LikeDislikeImages = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { imageId, userId } = req.body;

    if (!imageId || !userId) {
      return res.status(400).json({
        message:
          "Cannot like or dislike the post, provide imageId, and userId.",
        result: {},
      });
    }

    const result = await likeOrDislikeImage(imageId, userId);

    if (result) {
      console.log(`Image liked by ${userId}`);
      return res.status(200).json({
        message: "Image liked.",
        result: { result },
      });
    } else {
      console.log(`Image disliked by ${userId}`);
      return res.status(200).json({
        message: "Image disliked.",
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

export const LikenOnImg = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({
        message: "Cannot counts likes on provide imageId.",
        result: {},
      });
    }

    const result = await likesOnImage(imageId);

    if (result) {
      console.log(`Image liked by ${imageId}`);
      return res.status(200).json({
        message: "Image total likes.",
        result: { result },
      });
    } else {
      console.log(`Image disliked by ${imageId}`);
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
//======================================Get ALL Cooments===================================================

export const getAllComments = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { imageId, page, pageSize } = req.body;
    if (!imageId) {
      return res.status(400).json({
        message: "imageId not provided.",
        result: {},
      });
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 10;

    const result = await commentsAggregate(
      imageId.toString(),
      parsedPage,
      parsedPageSize
    );

    if (result) {
      return res.status(200).json({
        status: "success",
        message: "Image comments loaded successfully.",
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
