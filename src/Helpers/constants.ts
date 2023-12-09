import { Storage } from "@google-cloud/storage";
require("dotenv").config();
import path from "path";

export const fileStorage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "",
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE || "",
});

// fileStorage.getBuckets().then((x) => console.log(x));

export const fileBucket = fileStorage.bucket(process.env.STORAGE_BUCKET || "");
