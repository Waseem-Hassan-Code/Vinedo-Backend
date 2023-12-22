import mongoose from "mongoose";

const vidCommentsSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videos",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export const VideoCommentsModel = mongoose.model(
  "videoComments",
  vidCommentsSchema
);

export const getComments = async (videoId: string) => {
  return await VideoCommentsModel.find({ videoId: videoId });
};

export const addComment = (values: Record<string, any>) => {
  return new VideoCommentsModel(values)
    .save()
    .then((comment) => comment.toObject());
};

export const updateComment = async (
  videoId: string,
  userId: string,
  commentId: string,
  newComment: string
) => {
  const result = await VideoCommentsModel.findOneAndUpdate(
    {
      _id: commentId,
      userId: userId,
      videoId: videoId,
    },
    { $set: { comment: newComment } },
    { new: true }
  );
  return result;
};

export const deleteComment = async (
  videoId: string,
  userId: string,
  commentId: string
) => {
  const result = await VideoCommentsModel.findOneAndDelete({
    _id: commentId,
    userId: userId,
    videoId: videoId,
  });
  return result;
};
