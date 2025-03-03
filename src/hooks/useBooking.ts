"use client";

import { useCallback } from "react";
import { bookClassesRequest } from "@/app/api/v1/booked-classes/request";
import logger from "@/lib/logger";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { addDays, isBefore, isAfter } from "date-fns";
import { MAX_BOOKING_DAYS, MIN_BOOKING_DAYS } from "@/lib/constants";

export const useBooking = (
  selectedSlots: Date[],
  isRecurrentSchedule: boolean
) => {
  const router = useRouter();
  const handleBook = useCallback(async () => {
    try {
      const now = new Date();
      const minBookingDate = addDays(now, MIN_BOOKING_DAYS);
      const maxBookingDate = addDays(now, MAX_BOOKING_DAYS);

      if (!isRecurrentSchedule) {
        for (const slot of selectedSlots) {
          if (isBefore(slot, minBookingDate)) {
            toast.error(
              `You must book classes at least ${MIN_BOOKING_DAYS} days in advance.`
            );
            logger.error(
              { slot, minBookingDate },
              "You must book classes at least 2 days in advance."
            );
            return;
          }
          if (isAfter(slot, maxBookingDate)) {
            toast.error(
              `You can only book classes up to ${MAX_BOOKING_DAYS} days in advance.`
            );
            logger.error(
              { slot, maxBookingDate },
              "You can only book classes up to 31 days in advance."
            );
            return;
          }
        }
      }

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
