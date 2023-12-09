import mongoose from "mongoose";

const ImageShema = new mongoose.Schema({
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
  likes: {
    type: Number,
    default: 0,
  },
});

export const ImageModel = mongoose.model("images", ImageShema);

export const addImage = (values: Record<string, any>) => {
  return new ImageModel(values).save().then((image) => image.toObject());
};

export const deleteImage = (imageId: string, creatorId: string) => {
  const deleted = ImageModel.findByIdAndDelete({ _id: imageId, creatorId });
  if (deleted) {
    return "Image deleted!";
  } else {
    return "Failed to delete!";
  }
};

export const updateImageTitle = (id: string, title: string) => {
  return ImageModel.findByIdAndUpdate(
    id,
    { $set: { Title: title } },
    { new: true }
  );
};

export const updateImageDescription = (id: string, description: string) => {
  return ImageModel.findByIdAndUpdate(
    id,
    { $set: { description: description } },
    { new: true }
  );
};
