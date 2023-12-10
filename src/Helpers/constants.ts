import { Storage } from "@google-cloud/storage";
require("dotenv").config();
import path from "path";

export const fileStorage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "",
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE || "",
});

// fileStorage.getBuckets().then((x) => console.log(x));
export const removedFromSubscription = "A3bDe7GhJ";
export const alreadySubscribed = "1KlMnO8Pq";
export const notSubscribed = "R2sTuVwX5";

export const fileBucket = fileStorage.bucket(process.env.STORAGE_BUCKET || "");
