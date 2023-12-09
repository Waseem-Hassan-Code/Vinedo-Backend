import multer, { MulterError } from "multer";
import { CustomRequest } from "../Types/types";
import { fileBucket, fileStorage } from "../Helpers/constants";

const storage = (destination: string) => {
  const storage = fileStorage;
  const bucket = fileBucket;

  return multer.memoryStorage();
};

const ImageFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: (error: MulterError | null, acceptFile: boolean) => void
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Invalid file type. Only JPEG, PNG, GIFs are allowed."
      ),
      false
    );
  }
};

const VideoFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: (error: MulterError | null, acceptFile: boolean) => void
) => {
  const allowedMimes = ["video/mp4", "video/webm", "video/quicktime"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Invalid file type. Only MP4, WebM, and QuickTime videos are allowed."
      ),
      false
    );
  }
};

export const uploadImage = multer({
  storage: storage("Images"),
  fileFilter: ImageFilter,
});

export const uploadVideo = multer({
  storage: storage("Videos"),
  fileFilter: VideoFilter,
});

export const uploadProfile = multer({
  storage: storage("Profile"),
  fileFilter: ImageFilter,
});
