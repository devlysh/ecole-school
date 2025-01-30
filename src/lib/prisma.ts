import { PrismaClient } from "@prisma/client";
import logger from "./logger";

let prisma: PrismaClient;
try {
  prisma = new PrismaClient({
    log: ["info", "warn", "error"],
  });
} catch (err: unknown) {
  logger.error(err, "Error initializing Prisma Client");
}

export default prisma!;
