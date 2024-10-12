import pino from "pino";

const logger = pino({
  level: process.env["NODE_ENV"] === "production" ? "info" : "trace",
});

export default logger;
