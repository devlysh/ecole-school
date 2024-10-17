import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const languages = await prisma.language.findMany();
    return Response.json(languages);
  } catch (err: unknown) {
    logger.error(err, "Error fetching languages");
    return Response.json("Failed to fetch languages", { status: 500 });
  }
};
