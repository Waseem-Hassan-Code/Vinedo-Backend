import mongoose from "mongoose";

const VideoShema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  postDate: { type: Date, required: true },
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

export const getAllVideosPaginated = async (
  creatorId: string,
  skip: number,
  pageSize: number
) => {
  return VideoModel.find({ creatorId: creatorId })
    .sort({ postDate: -1 })
    .skip(skip)
    .limit(pageSize);
};

export const addVideo = (values: Record<string, any>) => {
  return new VideoModel(values).save().then((video) => video.toObject());
};

export const deleteVideo = (videoId: string, creatorId: string) => {
  const deleted = VideoModel.findByIdAndDelete({ _id: videoId, creatorId });
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
