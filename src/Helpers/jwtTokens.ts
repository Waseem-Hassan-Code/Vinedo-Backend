import jwt from "jsonwebtoken";
require("dotenv").config();

export const createToken = (payLoad: any) => {
  return jwt.sign(payLoad, process.env.SECRET_KEY, { expiresIn: "10h" });
};

export const readToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
};
