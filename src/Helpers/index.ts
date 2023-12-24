import crypto from "crypto";
import fs from "fs";
import { Stream } from "stream";
import ffmpeg from "fluent-ffmpeg";

const SECRET = "THIS-IS-SECRETHEXADECIMAL*^^%!42dlaaflJLK";

export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};

export const generateOTP = () => {
  const min = 100000;
  const max = 999999;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
};

export const deleteFile = (imageURL: string) => {
  const filePath = imageURL;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err.message}`);
    } else {
    }
  });
};

export const otpStorage: Map<number, { otp: string; expirationTime: number }> =
  new Map();

export const expirationTime = new Date().getTime() + 5 * 60 * 1000;

export var streamToBuffer = (stream: Stream): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

//..................................GENERATE THUMBNAIL FOR VIDEO....................................
export const generateThumbnail = async (
  inputPath: string,
  outputPath: string
) => {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .on("end", () => {
        resolve();
      })
      .on("error", (err: any) => {
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: outputPath,
        filename: "thumbnail.png",
        timestamps: ["20%"],
        size: "320x240",
      });
  });
};
