const { Images, Videos, ImageComments, VideoComments } = require("../models");

const pageSize = 10;
const page = 1;

const pipeline = [
  {
    $facet: {
      images: [
        { $match: {} }, // Add any additional filters if needed
        { $sort: { date: -1 } },
        { $limit: pageSize * page },
      ],
      videos: [
        { $match: {} }, // Add any additional filters if needed
        { $sort: { date: -1 } },
        { $limit: pageSize * page },
      ],
      imageComments: [
        { $match: {} }, // Add any additional filters if needed
        { $sort: { date: -1 } },
        { $limit: pageSize * page },
      ],
      videoComments: [
        { $match: {} }, // Add any additional filters if needed
        { $sort: { date: -1 } },
        { $limit: pageSize * page },
      ],
    },
  },
  {
    $project: {
      combinedData: {
        $concatArrays: [
          "$images",
          "$videos",
          "$imageComments",
          "$videoComments",
        ],
      },
    },
  },
  { $unwind: "$combinedData" },
  { $sort: { "combinedData.date": -1 } },
  { $skip: pageSize * (page - 1) },
  { $limit: pageSize },
];

// const result = await Promise.all(
//   pipeline.map((stage) => {
//     if (stage.$facet) {
//       return { $facet: stage.$facet };
//     }
//     return stage;
//   })
// );

// const combinedResults = result[result.length - 1].combinedData;
// console.log(combinedResults);
