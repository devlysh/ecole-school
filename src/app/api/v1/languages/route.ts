import { handleErrorResponse } from "@/lib/errorUtils";
import logger from "@/lib/logger";
import { LanguagesRepository } from "@domain/repositories/Languages.repository";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const languages = await new LanguagesRepository().findAll();
    return Response.json(languages, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error fetching languages");
    return handleErrorResponse(new Error("Failed to fetch languages"), 500);
  }
};
