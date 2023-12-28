import express from "express";
import { findVideo, getAllVideosPaginated } from "../Model/videos";
import { fileBucket } from "../Helpers/constants";
import { getComments } from "../Model/videoComments";
import { getAllImagesPaginated } from "../Model/images";
import { streamToBuffer } from "../Helpers";
import { parseRange } from "../Helpers/ParseStreamRange";

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

//=============================VIDEO STREAM=================================
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

    const metadata = await file.getMetadata();
    const fileSize = metadata[0].size;

    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const rangeRequest = parseRange(<number>fileSize, rangeHeader);
      res.status(206);
      res.set({
        "Content-Range": `bytes ${rangeRequest[0].start}-${rangeRequest[0].end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": rangeRequest[0].end - rangeRequest[0].start + 1,
        "Content-Type": "video/mp4",
      });

      file
        .createReadStream({
          start: rangeRequest[0].start,
          end: rangeRequest[0].end,
        })
        .pipe(res);
    } else {
      res.set({
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      file.createReadStream().pipe(res);
    }

    res.write(
      JSON.stringify({
        videoId: video._id,
        title: video.title,
        description: video.description,
      })
    );
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
