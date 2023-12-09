import { Storage } from "@google-cloud/storage";
require("dotenv").config();

export const fileStorage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "",
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE || "",
});

export const fileBucket = fileStorage.bucket(process.env.STORAGE_BUCKET || "");
