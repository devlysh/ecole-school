import logger from "@/lib/logger";
import { AvailableSlotsService } from "@domain/services/AvailableSlots.service";
import { verifyAccessToken } from "@/lib/jwt";
import { expandTime } from "@/lib/utils";
import { BadRequestError, EmailIsMissingError } from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";

export const GET = async (request: Request) => {
  return await handleGetAvailableSlotsRequest(request);
};

const handleGetAvailableSlotsRequest = async (
  request: Request
): Promise<Response> => {
  try {
    const parsedUrl = new URL(request.url);
    const startDateParam = parsedUrl.searchParams.get("startDate") ?? undefined;
    const endDateParam = parsedUrl.searchParams.get("endDate") ?? undefined;
    const selectedSlotsParam =
      parsedUrl.searchParams.get("selectedSlots") ?? undefined;
    const recurrentScheduleParam =
      parsedUrl.searchParams.get("recurrentSchedule") ?? undefined;

    if (!startDateParam || !endDateParam) {
      throw new BadRequestError("Start date and end date are required", {
        startDate: startDateParam,
        endDate: endDateParam,
      });
    }

    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      throw new EmailIsMissingError();
    }

    const isRecurrentSchedule = recurrentScheduleParam === "true";
    const selectedSlots = parseSelectedSlots(selectedSlotsParam);

    const availableHoursService = new AvailableSlotsService();
    const hourSlots = await availableHoursService.getAvailableSlots({
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam),
      selectedSlots,
      isRecurrentSchedule,
      email,
    });

    return Response.json(hourSlots, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof BadRequestError) {
      return handleErrorResponse(err, 400, {
        ...err.metadata,
      });
    }
    logger.error(err, "Error fetching available hours");
    return handleErrorResponse(
      new Error("Failed to fetch available hours"),
      500
    );
  }
};

const parseSelectedSlots = (param?: string): Date[] => {
  if (!param) return [];
  return param.split(",").map((slot) => {
    return new Date(expandTime(Number(slot)));
  });
};
