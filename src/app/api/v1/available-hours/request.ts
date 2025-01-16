import logger from "@/lib/logger";
import { compressTime } from "@/lib/utils";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getAvailableSlotsRequest = async (
  startDate: string,
  endDate: string,
  selectedSlots?: Date[],
  recurrentSchedule?: boolean
) => {
  const url = new URL(`${NEXT_PUBLIC_BASE_URL}/api/v1/available-hours`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);

  if (selectedSlots && selectedSlots.length) {
    url.searchParams.append(
      "selectedSlots",
      selectedSlots.map((slot) => compressTime(slot.getTime())).join(",")
    );
  }

  if (recurrentSchedule) {
    url.searchParams.append("recurrentSchedule", "true");
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    logger.error({ response }, "Error fetching available hours");
    throw new Error(response.statusText ?? "Failed to fetch available hours");
  }

  return await response.json();
};
