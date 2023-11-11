import express, { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import path from "path";

interface CustomRequest extends Request {
  file: Express.Multer.File;
}

const storage = (destination: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "../../", destination));
    },
    filename: (req, file, cb) => {
      console.log(file);
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const fileFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: (error: MulterError | null, acceptFile: boolean) => void
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Invalid file type. Only JPEG, PNG, GIF, MP4, WebM, and QuickTime videos are allowed."
      ),
      false
    );
  }
};

export const uploadImage = multer({
  storage: storage("Images"),
  fileFilter: fileFilter,
});

export const uploadVideo = multer({
  storage: storage("Videos"),
  fileFilter: fileFilter,
});

export const uploadProfile = multer({
  storage: storage("Profile"),
  fileFilter: fileFilter,
});
