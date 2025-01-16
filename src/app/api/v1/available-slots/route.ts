import logger from "@/lib/logger";
import { AvailableSlotsService } from "@domain/services/AvailableSlots.service";
import { verifyAccessToken } from "@/lib/jwt";
import { expandTime } from "@/lib/utils";

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
      return Response.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      return Response.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    const isRecurrentSchedule = recurrentScheduleParam === "true";
    const selectedSlots = parseSelectedSlots(selectedSlotsParam);

    // Use the service to retrieve data
    const availableHoursService = new AvailableSlotsService();
    const hourSlots = await availableHoursService.getAvailableSlots({
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam),
      selectedSlots,
      isRecurrentSchedule,
      email,
    });

    return Response.json(hourSlots, { status: 200 });
  } catch (err) {
    logger.error(err, "Error fetching available hours");
    return Response.json(
      { error: "Failed to fetch available hours" },
      { status: 500 }
    );
  }
};

const parseSelectedSlots = (param?: string): Date[] => {
  if (!param) return [];
  return param.split(",").map((slot) => {
    return new Date(expandTime(Number(slot)));
  });
};
