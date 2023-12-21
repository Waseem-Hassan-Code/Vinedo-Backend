import express from "express";
import {
  ImageCommentsModel,
  addComment,
  deleteComment,
  updateComment,
} from "../Model/imageComments";
import { authorizedUser } from "../Helpers/validateUser";
import { getAllImagesPaginated } from "../Model/images";
import { fileBucket, fileStorage } from "../Helpers/constants";
import { getComments } from "../Model/videoComments";

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
    const images = await getAllImagesPaginated(creatorId, skip, pageSizeNumber);

    if (images && images.length > 0) {
      for (const image of images) {
        const imagePath = image.fileName;
        const comments = await getComments(image._id.toString());
        const file = fileBucket.file(imagePath);

        const readStream = file.createReadStream();

        res.write(`Processing Image: ${image.title}\n\nComments:\n`);
        comments.forEach((comment) => {
          res.write(`${comment}\n`);
        });

        readStream.pipe(res, { end: false });
      }

      res.end();
    } else {
      return res.status(404).json({
        message: "No Images found for the specified creator.",
        result: {},
      });
    }
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
