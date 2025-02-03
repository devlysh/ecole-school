"use client";

import { useState, useCallback, useEffect } from "react";
import { getAvailableSlotsRequest } from "@/app/api/v1/available-slots/request";
import { AvailableCalendarSlot } from "@/lib/types";
import { format } from "date-fns";
import logger from "@/lib/logger";
import { expandTime } from "@/lib/utils";
import { toast } from "react-toastify";

export const useAvailableSlots = () => {
  const [availableSlots, setAvailableSlots] = useState<AvailableCalendarSlot[]>(
    []
  );
  const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
  const [isRecurrentSchedule, setIsRecurrentSchedule] = useState<boolean>(true);

  const fetchAvailableSlots = useCallback(
    async (start: Date, end: Date) => {
      try {
        const fetchedData = await getAvailableSlotsRequest(
          format(start, "yyyy-MM-dd"),
          format(end, "yyyy-MM-dd"),
          selectedSlots,
          isRecurrentSchedule
        );
        const slots = fetchedData.map((slot: number) => {
          const date = new Date(expandTime(slot));
          return { day: date.getDay(), hour: date.getHours() };
        });
        setAvailableSlots(slots);
      } catch (err: unknown) {
        toast.error("Failed to fetch available slots");
        logger.error(err, "Error fetching available slots");
      }
    },
    [isRecurrentSchedule, selectedSlots]
  );

  useEffect(() => {
    setSelectedSlots([]);
  }, [isRecurrentSchedule]);

  return {
    availableSlots,
    selectedSlots,
    setSelectedSlots,
    isRecurrentSchedule,
    setIsRecurrentSchedule,
    fetchAvailableSlots,
  };
};
