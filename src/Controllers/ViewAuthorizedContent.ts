import express from "express";
import { findVideo, getAllVideosPaginated } from "../Model/videos";
import { fileBucket } from "../Helpers/constants";
import { getComments } from "../Model/videoComments";
import { getAllImagesPaginated } from "../Model/images";
import { streamToBuffer } from "../Helpers";

//==============================GET VIDEOS THUMBNAILS=================================
export const getVideosThumbnails_User = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { creatorId, page = 1, pageSize = 10 } = req.body;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (
      isNaN(pageNumber) ||
      isNaN(pageSizeNumber) ||
      pageNumber <= 0 ||
      pageSizeNumber <= 0
    ) {
      return res.status(400).json({
        message: "Invalid page or pageSize parameters.",
        result: [],
      });
    }

    if (!creatorId) {
      return res.status(404).json({
        message: "Videos not found.",
        result: [],
      });
    }

    const skip = (pageNumber - 1) * pageSizeNumber;
    const videos = await getAllVideosPaginated(creatorId, skip, pageSizeNumber);

    const videoArray = [];
    for (const video of videos) {
      const videoPath = video.thumbnailName;
      const file = fileBucket.file(videoPath);
      const readStream = file.createReadStream();

      videoArray.push({
        videoId: video._id,
        title: video.title,
      });

      readStream.pipe(res, { end: false });
    }

    res.status(200).json({
      message: "Videos retrieved successfully.",
      result: videoArray,
    });

    res.end();
  } catch (error) {
    console.error("Error retrieving videos:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: [],
    });
  }
};
//==============================GET VIDEOS THUMBNAILS============================
export const getVideoStream_User = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { videoId, creatorId } = req.query;

    if (!videoId || !creatorId) {
      return res.status(400).json({
        message: "Invalid or missing videoId or creatorId parameters.",
        result: {},
      });
    }

    const video = await findVideo(videoId.toString(), creatorId.toString());

    if (!video) {
      return res.status(404).json({
        message: "Video not found.",
        result: {},
      });
    }

    const file = fileBucket.file(video.fileName);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");

    const readStream = file.createReadStream();

    res.write(
      JSON.stringify({
        videoId: video._id,
        title: video.title,
        description: video.description,
      })
    );

    readStream.on("open", () => {
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
          ? parseInt(parts[1], 10)
          : (typeof file.metadata.size === "number" ? file.metadata.size : -1) -
            1;

        const chunkSize = end - start + 1;
        console.log(chunkSize);

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${file.metadata.size}`,
          "Content-Length": chunkSize,
        });

        readStream.pipe(res, { end: false });
      } else {
        res.setHeader("Content-Length", file.metadata.size);
        readStream.pipe(res);
      }
    });

    res.write("\n");

    readStream.on("error", (error) => {
      console.error("Error streaming video:", error);
      res.status(500).end();
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: {},
    });
  }
};
//====================================GET IMAGES=================================

export const getImages_User = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, creatorId, page = 1, pageSize = 10 } = req.body;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (!creatorId || !userId) {
      return res.status(404).json({
        message: "Images not found.",
        result: [],
      });
    }

    const skip = (pageNumber - 1) * pageSizeNumber;
    const images = await getAllImagesPaginated(creatorId, skip, pageSizeNumber);

    const formattedImages = await Promise.all(
      images.map(async (image) => {
        const imagePath = image.fileName;
        const comments = await getComments(image._id.toString());
        const file = fileBucket.file(imagePath);
        const readStream = file.createReadStream();

        const buffer = await streamToBuffer(readStream);

        return {
          imageId: image._id,
          title: image.title,
          description: image.description,
          comments,
          imageData: buffer.toString("base64"),
        };
      })
    );

    return res.status(200).json({
      message: "Images retrieved successfully.",
      result: formattedImages,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      result: [],
    });
  }
};
