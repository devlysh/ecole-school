import { PrismaClient } from "@prisma/client";
import logger from "./logger";

let prisma: PrismaClient;
try {
  prisma = new PrismaClient({
    //**
    // Uncomment, when to see the prisma queries in the console
    //
    // log: ["info", "warn", "error"], // this line
    //
    // */
  });
} catch (err: unknown) {
  logger.error(err, "Error initializing Prisma Client");
}

export default prisma!;
