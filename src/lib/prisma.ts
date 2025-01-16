import { PrismaClient } from "@prisma/client";
import logger from "./logger";

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient({
    log: ["info", "warn", "error"],
  });
} catch (error) {
  logger.error({ error }, "Error initializing Prisma Client");
}

if (!prisma) {
  throw new Error("Prisma Client not initialized");
}

// Ensure the Prisma Client disconnects when the application exits
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
