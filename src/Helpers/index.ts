import crypto from "crypto";
import fs from "fs";
const SECRET = "THIS-IS-SECRET";

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
      console.log("File deleted successfully");
    }
  });
};

export const otpStorage: Map<number, { otp: string; expirationTime: number }> =
  new Map();

export const expirationTime = new Date().getTime() + 5 * 60 * 1000;
