"use client";

import { Button, Switch } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { AccountBookClassesCalendar } from "./AccountBookClassesCalendar";
import { getAvailableHoursRequest } from "@/app/api/v1/available-hours/request";
import { bookClasses } from "@/app/api/v1/book-classes/request";
import { AvailableHour } from "@/lib/types";

const AccountBookClasses: React.FC = () => {
  const [availableSlots, setAvailableSlots] = useState<AvailableHour[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<AvailableHour[]>([]);
  const [isFixedSchedule, setIsFixedSchedule] = useState<boolean>(true);

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  useEffect(() => {
    const fetchInitialSlots = async () => {
      try {
        const now = new Date();
        const startOfWeek = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - now.getUTCDay()
          )
        );
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

        const data = await getAvailableHoursRequest(
          startOfWeek.toISOString().split("T")[0],
          endOfWeek.toISOString().split("T")[0],
          undefined,
          isFixedSchedule
        );
        setAvailableSlots(data);
      } catch (error) {
        console.error("Error fetching initial slots:", error);
      }
    };
    fetchInitialSlots();
  }, [isFixedSchedule]);

  const handleBook = async () => {
    try {
      await bookClasses(selectedSlots);
      alert("Booking(s) successful!");
      setSelectedSlots([]);

      const now = new Date();
      const startOfWeek = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - now.getUTCDay()
        )
      );
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

      const fresh = await getAvailableHoursRequest(
        startOfWeek.toISOString().split("T")[0],
        endOfWeek.toISOString().split("T")[0],
        undefined,
        isFixedSchedule
      );
      setAvailableSlots(fresh);
    } catch (error) {
      console.error("Error booking classes:", error);
      alert("Booking failed. Check console.");
    }
  };

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
        setAvailableSlots={setAvailableSlots}
        oneWeek={isFixedSchedule}
      />
    </div>
  );
};

export default AccountBookClasses;
