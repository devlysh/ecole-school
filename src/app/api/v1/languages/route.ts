import { handleErrorResponse } from "@/lib/errorUtils";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const languages = await prisma.language.findMany();
    return Response.json(languages, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error fetching languages");
    return handleErrorResponse(new Error("Failed to fetch languages"), 500);
  }
};
