"use client";

import { Button, Switch } from "@nextui-org/react";
import React from "react";
import { AccountBookClassesCalendar } from "./AccountBookClassesCalendar";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useBooking } from "@/hooks/useBooking";

const DEFAULT_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const AccountBookClasses: React.FC = () => {
  const {
    availableSlots,
    selectedSlots,
    setSelectedSlots,
    isRecurrentSchedule,
    setIsRecurrentSchedule,
    fetchAvailableSlots,
    clearAvailableSlots,
  } = useAvailableSlots();

  const { handleBook } = useBooking(selectedSlots, isRecurrentSchedule);

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
            onValueChange={(value) => {
              setIsRecurrentSchedule(value);
              clearAvailableSlots();
            }}
          >
            Fixed schedule
          </Switch>
        </div>
      </div>
      <AccountBookClassesCalendar
        availableSlots={availableSlots}
        selectedSlots={selectedSlots}
        hours={DEFAULT_HOURS}
        setSelectedSlots={setSelectedSlots}
        isRecurrentSchedule={isRecurrentSchedule}
        fetchAvailableSlots={fetchAvailableSlots}
        clearAvailableSlots={clearAvailableSlots}
      />
    </div>
  );
};

export default AccountBookClasses;
