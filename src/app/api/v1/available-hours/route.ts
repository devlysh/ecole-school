import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { AvailableHoursService } from "@domain/available-hours/AvailableHoursService";

export const GET = async (request: Request) => {
  return handleGetAvailableHoursRequest(request);
};

export const handleGetAvailableHoursRequest = async (
  request: Request
): Promise<NextResponse> => {
  try {
    const parsedUrl = new URL(request.url);
    const startDateParam = parsedUrl.searchParams.get("startDate") ?? undefined;
    const endDateParam = parsedUrl.searchParams.get("endDate") ?? undefined;
    const selectedSlotsParam =
      parsedUrl.searchParams.get("selectedSlots") ?? undefined;
    const fixedScheduleParam =
      parsedUrl.searchParams.get("fixedSchedule") ?? undefined;

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Use the service to retrieve data
    const service = new AvailableHoursService();
    const hourSlots = await service.getAvailableHours({
      startDateParam,
      endDateParam,
      selectedSlotsParam,
      fixedScheduleParam,
    });

    return NextResponse.json(hourSlots, { status: 200 });
  } catch (err) {
    logger.error(err, "Error fetching available hours");
    return NextResponse.json(
      { error: "Failed to fetch available hours" },
      { status: 500 }
    );
  }
};
