"use client";

import { Button, Switch } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { AccountBookClassesCalendar } from "./AccountBookClassesCalendar";
import { getAvailableHoursRequest } from "@/app/api/v1/available-hours/request";
import { AvailableCalendarSlot } from "@/lib/types";
import { addDays, startOfWeek, format } from "date-fns";
import logger from "@/lib/logger";
import { bookClassesRequest } from "@/app/api/v1/booked-classes/request";
import { expandTime } from "@/lib/utils";

const AccountBookClasses: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<AvailableCalendarSlot[]>(
    []
  );
  const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
  const [isRecurrentSchedule, setIsRecurrentSchedule] = useState<boolean>(true);

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

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

  useEffect(() => {
    const now = new Date();
    const start = isRecurrentSchedule
      ? startOfWeek(now, { weekStartsOn: 0 })
      : startOfWeek(now);
    const endOfWeek = addDays(start, 6);
    fetchAvailableSlots(start, endOfWeek);
  }, [fetchAvailableSlots, isRecurrentSchedule]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">Book your classes:</div>
          <div className="text-sm text-gray-500">
            Choose days and times you would like to have your classes
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleBook}>Book</Button>
          <Switch
            isSelected={isRecurrentSchedule}
            onValueChange={setIsRecurrentSchedule}
          >
            Recurrent schedule
          </Switch>
        </div>
      </div>
      <AccountBookClassesCalendar
        availableSlots={availableSlots}
        selectedSlots={selectedSlots}
        hours={hours}
        setSelectedSlots={setSelectedSlots}
        oneWeek={isRecurrentSchedule}
        fetchAvailableSlots={fetchAvailableSlots}
      />
    </div>
  );
};

export default AccountBookClasses;
