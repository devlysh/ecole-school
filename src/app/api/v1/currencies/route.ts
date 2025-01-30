import { handleErrorResponse } from "@/lib/errorUtils";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const currencies = await prisma.currency.findMany();

    return Response.json(currencies, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error fetching currencies");
    return handleErrorResponse(new Error("Failed to fetch currencies"), 500);
  }
};
