import { useCallback } from "react";
import { bookClassesRequest } from "@/app/api/v1/booked-classes/request";
import logger from "@/lib/logger";

export const useBooking = (selectedSlots: Date[], isRecurrentSchedule: boolean) => {
  const handleBook = useCallback(async () => {
    try {
      await bookClassesRequest(
        selectedSlots.map((slot) => slot.getTime()),
        isRecurrentSchedule
      );
      logger.info("Classes booked successfully");
    } catch (error) {
      logger.error({ error }, "Failed to book classes");
    }
  }, [selectedSlots, isRecurrentSchedule]);

  return { handleBook };
}; 