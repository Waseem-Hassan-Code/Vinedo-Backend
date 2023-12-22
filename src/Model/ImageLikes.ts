import mongoose from "mongoose";

const imageLikeSchema = new mongoose.Schema({
  Like: { type: Boolean, required: true },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "images",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const ImageLike = mongoose.model("ImageLikes", imageLikeSchema);

export const likesOnImage = async (imageId: string): Promise<number> => {
  try {
    const likeCount = await ImageLike.countDocuments({ imageId });

    return likeCount;
  } catch (error) {
    console.error("Error while counting likes on video:", error);
    throw error;
  }
};

export const likeOrDislikeImage = async (userId: string, imageId: string) => {
  try {
    const existingLike = await ImageLike.findOne({ userId, imageId });

    if (existingLike) {
      if (existingLike.Like) {
        await existingLike.deleteOne();
        return null;
      } else {
        return existingLike;
      }
    } else {
      const newLike = new ImageLike({
        Like: true,
        imageId,
        userId,
      });
      await newLike.save();
      return newLike;
    }
  } catch (error) {
    console.error("Error while processing like/dislike:", error);
    throw error;
  }
};
