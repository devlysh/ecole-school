import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const currencies = await prisma.currency.findMany();
    return Response.json(currencies);
  } catch (error) {
    logger.error("Error fetching languages:", error);
    return Response.json("Failed to fetch currencies", { status: 500 });
  }
};
