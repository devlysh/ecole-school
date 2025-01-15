import { useState, useCallback } from "react";
import { getAvailableHoursRequest } from "@/app/api/v1/available-hours/request";
import { AvailableCalendarSlot } from "@/lib/types";
import { format } from "date-fns";
import logger from "@/lib/logger";
import { expandTime } from "@/lib/utils";

export const useAvailableSlots = () => {
  const [availableSlots, setAvailableSlots] = useState<AvailableCalendarSlot[]>(
    []
  );
  const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
  const [isRecurrentSchedule, setIsRecurrentSchedule] = useState<boolean>(true);

  const fetchAvailableSlots = useCallback(
    async (start: Date, end: Date) => {
      try {
        const fetchedData = await getAvailableHoursRequest(
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
      } catch (err) {
        logger.error({ err }, "Error fetching available slots");
      }
    },
    [isRecurrentSchedule, selectedSlots]
  );

  return {
    availableSlots,
    selectedSlots,
    setSelectedSlots,
    isRecurrentSchedule,
    setIsRecurrentSchedule,
    fetchAvailableSlots,
  };
};
