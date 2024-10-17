import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const currencies = await prisma.currency.findMany();
    return Response.json(currencies);
  } catch (err: unknown) {
    logger.error(err, "Error fetching currencies");
    return Response.json("Failed to fetch currencies", { status: 500 });
  }
};
