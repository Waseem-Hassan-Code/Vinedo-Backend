import crypto from "crypto";

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

export const otpStorage: Map<number, { otp: string; expirationTime: number }> =
  new Map();

export var expirationTime = new Date().getTime() + 5 * 60 * 1000;
