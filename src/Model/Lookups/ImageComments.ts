import { UserModel } from "../users";
import { ImageCommentsModel } from "../imageComments";

export const commentsAggregate = async (
  imageId: string,
  page = 1,
  pageSize = 10
) => {
  const skip = (page - 1) * pageSize;

  const aggregateQuery = [
    {
      $lookup: {
        from: "imagecomments",
        localField: "_id",
        foreignField: "userId",
        as: "comments",
      },
    },
    {
      $match: {
        "comments.imageId": imageId,
      },
    },
    {
      $project: {
        _id: 1,
        comment: 1,
        imageId: 1,
        userId: 1,
        "comments.name": 1,
      },
    },
  ];

  try {
    const result = await UserModel.aggregate(aggregateQuery).exec();
    return result;
  } catch (error) {
    console.error(`Error in commentsAggregate for ImageId ${imageId}:`, error);
    throw error;
  }
};
