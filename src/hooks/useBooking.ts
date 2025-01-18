"use client";

import { useCallback } from "react";
import { bookClassesRequest } from "@/app/api/v1/booked-classes/request";
import logger from "@/lib/logger";
import { useRouter } from "next/navigation";

export const useBooking = (
  selectedSlots: Date[],
  isRecurrentSchedule: boolean
) => {
  const router = useRouter();
  const handleBook = useCallback(async () => {
    try {
      await bookClassesRequest(
        selectedSlots.map((slot) => slot.getTime()),
        isRecurrentSchedule
      );
      logger.info("Classes booked successfully");
      router.push("/account/my-classes");
    } catch (error) {
      logger.error({ error }, "Failed to book classes");
    }
  }, [selectedSlots, isRecurrentSchedule, router]);

  return { handleBook };
};
