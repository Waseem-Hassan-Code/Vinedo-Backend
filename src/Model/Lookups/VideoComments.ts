import { UserModel } from "../users";
import { VideoCommentsModel } from "../videoComments";

export const commentsAggregate = async (
  videoId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const skip = (page - 1) * pageSize;

    const comments = await VideoCommentsModel.find({ videoId: videoId })
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
          videoId: comment.videoId,
        };
      })
    );

    return commentsObject;
  } catch (error) {
    console.error(`Error in commentsAggregate for ImageId ${videoId}:`, error);
    throw error;
  }
};
