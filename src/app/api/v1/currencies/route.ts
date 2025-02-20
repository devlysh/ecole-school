import { handleErrorResponse } from "@/lib/errorUtils";
import logger from "@/lib/logger";
import { CurrenciesRepository } from "@domain/repositories/Currencies.repository";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const currencies = await new CurrenciesRepository().findAll();

    return Response.json(currencies, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error fetching currencies");
    return handleErrorResponse(new Error("Failed to fetch currencies"), 500);
  }
};
