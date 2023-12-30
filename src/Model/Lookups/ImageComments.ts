import { ImageCommentsModel } from "../imageComments";
import { UserModel } from "../users";

export const commentsAggregate = async (
  imageId: string,
  page = 1,
  pageSize = 10
) => {
  try {
    const skip = (page - 1) * pageSize;

    const comments = await ImageCommentsModel.find({ imageId: imageId })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const commentsObject = await Promise.all(
      comments.map(async (comment) => {
        const user = await UserModel.findById(comment.userId);

        return {
          _id: comment._id,
          comment: comment.comment,
          userIdName: user ? user.name : "",
          imageId: comment.imageId,
        };
      })
    );

    return commentsObject;
  } catch (error) {
    console.error(`Error in commentsAggregate for ImageId ${imageId}:`, error);
    throw error;
  }
};
