import winston from "winston";
import { createLogger, format, transports } from "winston";

import DailyRotateFile from "winston-daily-rotate-file";

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), customFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;
