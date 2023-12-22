import mongoose from "mongoose";

const videoLikeSchema = new mongoose.Schema({
  Like: { type: Boolean, required: true },
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

const VideoLike = mongoose.model("VideoLikes", videoLikeSchema);

export const likesOnVideo = async (videoId: string): Promise<number> => {
  try {
    const likeCount = await VideoLike.countDocuments({ videoId });

    return likeCount;
  } catch (error) {
    console.error("Error while counting likes on video:", error);
    throw error;
  }
};

export const likeOrDislikeVideo = async (userId: string, videoId: string) => {
  try {
    const existingLike = await VideoLike.findOne({ userId, videoId });

    if (existingLike) {
      existingLike.Like = !existingLike.Like;
      await existingLike.save();
      return existingLike;
    } else {
      const newLike = new VideoLike({
        Like: true,
        videoId,
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
