import crypto from "crypto";

const generateSecretKey = (length: number): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const secretKey: string = generateSecretKey(32);
