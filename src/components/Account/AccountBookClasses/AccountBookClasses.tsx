"use client";

import { Button, Switch } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { AccountBookClassesCalendar } from "./AccountBookClassesCalendar";
import { getAvailableHoursRequest } from "@/app/api/v1/available-hours/request";
import { bookClasses } from "@/app/api/v1/book-classes/request";
import { AvailableHour } from "@/lib/types";
import { addDays, startOfWeek, format } from "date-fns";
import logger from "@/lib/logger";

const AccountBookClasses: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<AvailableHour[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
  const [isFixedSchedule, setIsFixedSchedule] = useState<boolean>(true);

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const handleBook = useCallback(async () => {
    try {
      await bookClasses(selectedSlots, isFixedSchedule);
    } catch (error) {
      logger.error(error, "Error booking classes");
    }
  }, [selectedSlots, isFixedSchedule]);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      const now = new Date();
      const start = isFixedSchedule ? new Date() : startOfWeek(now);
      start.setHours(0, 0, 0, 0);

      const endOfWeek = addDays(start, 6);

      const fetchedData = await getAvailableHoursRequest(
        format(start, "yyyy-MM-dd"),
        format(endOfWeek, "yyyy-MM-dd"),
        selectedSlots.map((slot) => ({
          day: slot.getDay(),
          hour: slot.getHours(),
        })),
        isFixedSchedule
      );
      setAvailableSlots(fetchedData.hourSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  }, [isFixedSchedule, selectedSlots]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

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
            isSelected={isFixedSchedule}
            onValueChange={setIsFixedSchedule}
          >
            Fixed schedule
          </Switch>
        </div>
      </div>
      <AccountBookClassesCalendar
        availableSlots={availableSlots}
        selectedSlots={selectedSlots}
        hours={hours}
        setSelectedSlots={setSelectedSlots}
        oneWeek={isFixedSchedule}
      />
    </div>
  );
};

export default AccountBookClasses;
