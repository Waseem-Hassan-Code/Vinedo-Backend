import express, { response } from "express";
import { deleteFile } from "../Helpers";
import { UserModel, deleteProfilePicture } from "../Model/users";

//---------------------------Delete profile picture--------------------------------
export const removeProfilePicture = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.body;
    if (!id) {
      const response = {
        status: 400,
        message: "Invalid request. 'userId' is required.",
        result: {},
      };
      return res.status(400).json(response);
    }
    const user = await UserModel.findById(id).select("avatar.localPath").exec();
    if (user.avatar.localPath) {
      deleteFile(user.avatar.localPath);
      const profileURL = await deleteProfilePicture(id);
      if (profileURL) {
        const response = {
          status: 200,
          message: "Avatar removed successfully!",
          result: {},
        };
        return res.status(200).json(response);
      }
      const response = {
        status: 200,
        message: "Avatar removed successfully!",
        result: {},
      };
      return res.status(200).json(response);
    } else {
      const response = {
        status: 400,
        message: "Try again later!",
        result: {},
      };
      return res.status(400).json(response);
    }
  } catch {
    const response = {
      status: 500,
      message: "Internal Server Error",
      result: {},
    };
    return res.status(500).json(response);
  }
};
