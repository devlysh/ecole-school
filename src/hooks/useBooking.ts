"use client";

import { useCallback } from "react";
import { bookClassesRequest } from "@/app/api/v1/booked-classes/request";
import logger from "@/lib/logger";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
      toast.success("Classes booked successfully");
      logger.info("Classes booked successfully");
      router.push("/account/my-classes");
    } catch (err: unknown) {
      toast.error("Failed to book classes");
      logger.error(err, "Failed to book classes");
    }
  }, [selectedSlots, isRecurrentSchedule, router]);

  return { handleBook };
};
