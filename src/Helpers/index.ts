import crypto from "crypto";
import fs from "fs";
import { Stream } from "stream";
// import ffmpeg from "ffmpeg-static";
const ffmpeg = require("ffmpeg-stream");

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

// export const generateThumbnail = async (
//   videoUrl: string,
//   outputPath: string
// ): Promise<Buffer> => {
//   return new Promise<Buffer>((resolve, reject) => {
//     const spawn = require("child_process").spawn;
//     const outputBuffer: Buffer[] = [];

//     const process = spawn(ffmpeg, [
//       "-i",
//       videoUrl,
//       "-ss",
//       "20%",
//       "-vframes",
//       "1",
//       "-s",
//       "320x240",
//       "-f",
//       "image2pipe",
//       "pipe:1", // Output to stdout as image
//     ]);

//     process.stdout.on("data", (data: Buffer) => {
//       outputBuffer.push(data);
//     });

//     process.on("close", (code: number) => {
//       if (code === 0) {
//         const concatenatedBuffer = Buffer.concat(outputBuffer);
//         resolve(concatenatedBuffer);
//       } else {
//         reject(new Error(`ffmpeg process exited with code ${code}`));
//       }
//     });

//     process.on("error", (err: Error) => {
//       reject(err);
//     });

//     process.on("exit", (code: number) => {
//       if (code !== 0) {
//         reject(new Error(`ffmpeg process exited with code ${code}.`));
//       }
//     });
//   });
// };
