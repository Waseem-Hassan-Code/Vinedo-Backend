import mongoose from "mongoose";

const imgCommentsSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  imageId: {
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

export const ImageCommentsModel = mongoose.model(
  "imageComments",
  imgCommentsSchema
);

export const getCommentsImg = async (imageId: string) => {
  return await ImageCommentsModel.find({ imageId: imageId });
};

export const addComment = (values: Record<string, any>) => {
  return new ImageCommentsModel(values)
    .save()
    .then((comment) => comment.toObject());
};

export const updateComment = async (
  imageId: string,
  userId: string,
  commentId: string,
  newComment: string
) => {
  const result = await ImageCommentsModel.findOneAndUpdate(
    {
      _id: commentId,
      userId: userId,
      imageId: imageId,
    },
    { $set: { comment: newComment } },
    { new: true }
  );
  return result;
};

export const deleteComment = async (
  imageId: string,
  userId: string,
  commentId: string
) => {
  const result = await ImageCommentsModel.findOneAndDelete({
    _id: commentId,
    userId: userId,
    imageId: imageId,
  });
  return result;
};
