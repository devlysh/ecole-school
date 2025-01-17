import { PrismaClient } from "@prisma/client";
import logger from "./logger";

let prisma: PrismaClient;
try {
  prisma = new PrismaClient({
    log: ["info", "warn", "error"],
  });
} catch (error) {
  logger.error({ error }, "Error initializing Prisma Client");
}

export default prisma!;
