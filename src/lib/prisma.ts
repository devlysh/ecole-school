import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ensure the Prisma Client disconnects when the application exits
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
