import mongoose from "mongoose";

const VideoShema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

export const VideoModel = mongoose.model("videos", VideoShema);

export const addVideo = (values: Record<string, any>) => {
  new VideoModel(values).save().then((video) => video.toObject());
};

export const deleteVideo = (videoId: string) => {
  const deleted = VideoModel.findByIdAndDelete(videoId);
  if (deleted) {
    return "Video deleted!";
  } else {
    return "Failed to delete!";
  }
};

export const updateVideoTitle = (id: string, title: string) => {
  return VideoModel.findByIdAndUpdate(
    id,
    { $set: { Title: title } },
    { new: true }
  );
};

export const updateVideoDescription = (id: string, description: string) => {
  return VideoModel.findByIdAndUpdate(
    id,
    { $set: { description: description } },
    { new: true }
  );
};

export const addLike = (id: string) => {
  return VideoModel.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  );
};

export const removeLike = (id: string) => {
  return VideoModel.findByIdAndUpdate(
    id,
    { $inc: { likes: -1 } },
    { new: true }
  );
};

export const getAllVideosByUserId = async (creatorId: string) => {
  try {
    const videos = await VideoModel.find({ creatorId: creatorId }).exec();
    return videos;
  } catch (error) {
    console.error(`Error retrieving videos: ${error.message}`);
    return null;
  }
};

// export const getVideoById = async (videoId: string) => {
//   try {
//     const video = await VideoModel.findById(videoId).exec();
//     return video;
//   } catch (error) {
//     console.error(`Error retrieving video: ${error.message}`);
//     return null;
//   }
// };
