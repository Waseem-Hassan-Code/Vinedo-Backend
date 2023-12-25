import { fileBucket } from "../Helpers/constants";
import { UserModel } from "../Model/users";
import express from "express";
import { streamToBuffer } from "../Helpers";
import { json } from "body-parser";

export const getProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.query;

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

    if (!user || !user.avatar || !user.avatar.imageName) {
      return res.status(404).json({
        status: 404,
        message: "User or user avatar not found.",
        result: {},
      });
    }

    const file = fileBucket.file(user.avatar.imageName.trim());
    const readStream = file.createReadStream();

    readStream.pipe(res);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};
//================================================GET COVER==================================================
export const getCoverPicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      });
    }

    const user = await UserModel.findById(id)
      .select("cover.imageName cover.imagePath")
      .exec();

    if (!user || !user.cover || !user.cover.imageName) {
      return res.status(404).json({
        status: 404,
        message: "User or user avatar not found.",
        result: {},
      });
    }

    const file = fileBucket.file(user.cover.imageName.trim());
    const readStream = file.createReadStream();

    readStream.pipe(res);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      result: {},
    });
  }
};
