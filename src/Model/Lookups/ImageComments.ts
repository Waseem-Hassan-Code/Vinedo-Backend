import { ImageCommentsModel } from "../imageComments";

export const commentsAggregate = async (
  ImageId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const skip = (page - 1) * pageSize;

    const aggregateQuery = [
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          comment: 1,
          imageId: ImageId,
          userId: 1,
          userName: "$userDetails.name",
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ];

    const result = await ImageCommentsModel.aggregate(aggregateQuery).exec();

    return result;
  } catch (error) {
    console.error(`Error in commentsAggregate: ${error.message}`);
    throw error;
  }
};
