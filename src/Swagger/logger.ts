import pino from "pino";
import dayjs from "dayjs";
import pretty from "pino-pretty";

const prettyStream = pretty();
prettyStream.pipe(process.stdout);

const log = pino(
  {
    base: {
      pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
  },
  prettyStream
);

export default log;
